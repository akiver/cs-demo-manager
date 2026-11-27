#include "schema.h"

#include <algorithm>
#include <cstdio>
#include <cstring>

#include "interface.h"
#include "library.h"
#include "log.h"
#include "memory.h"
#include "plugin.h"
#include "schemasystem/schemasystem.h"

#ifdef _WIN32
#define SCHEMA_SYSTEM_LIB_NAME "schemasystem.dll"
#define CLIENT_SCHEMA_SCOPE_NAME "client.dll"
#define SERVER_SCHEMA_SCOPE_NAME "server.dll"
#else
#define SCHEMA_SYSTEM_LIB_NAME "libschemasystem.so"
#define CLIENT_SCHEMA_SCOPE_NAME "libclient.so"
#define SERVER_SCHEMA_SCOPE_NAME "libserver.so"
#endif

// No schema class of the game comes near that many fields, a larger count means the pointer isn't a class info.
constexpr int MAX_SCHEMA_FIELD_COUNT = 4096;

struct SchemaFieldLookup {
    const char* className;
    const char* fieldName;
    // A missing optional field doesn't disable the feature, its reads fall back on a default value. Required fields are
    // the ones the spectated player can't be found without.
    bool isOptional;
    int offset;
    // Size of the field in bytes, 0 for anything that isn't a fixed-size array.
    int size;
    // The name the schema gives the field's type, NULL when there is none to read.
    const char* typeName;
};

static SchemaFieldLookup schemaFields[FIELD_COUNT] = {
#define SCHEMA_FIELD_LOOKUP(id, className, fieldName, isOptional) {className, fieldName, isOptional, -1, 0, NULL},
    SCHEMA_FIELDS(SCHEMA_FIELD_LOOKUP)
#undef SCHEMA_FIELD_LOOKUP
};

static bool areSchemaFieldsResolved = false;
static bool hasLoggedSchemaFailure = false;
static bool hasLoggedSchemaScope = false;

// The number of bytes a fixed-size array field spans, 0 when the field is of another kind or its type looks wrong.
static int GetFixedArraySize(const SchemaClassFieldData_t& field) {
    const CSchemaType* type = field.m_pType;
    if (!IsObject(type) || !IsReadableMemory(type, sizeof(CSchemaType_FixedArray)) ||
        type->m_eTypeCategory != SCHEMA_TYPE_FIXED_ARRAY) {
        return 0;
    }

    const CSchemaType_FixedArray* array = (const CSchemaType_FixedArray*)type;
    if (array->m_nElementCount <= 0 || array->m_nElementSize == 0) {
        return 0;
    }

    return array->m_nElementCount * array->m_nElementSize;
}

// The name the schema gives the type of a field, NULL when the type or its name can't be read.
static const char* GetFieldTypeName(const SchemaClassFieldData_t& field) {
    const CSchemaType* type = field.m_pType;
    if (!IsObject(type) || !IsReadableMemory(type, sizeof(CSchemaType))) {
        return NULL;
    }

    // Get hands back an empty string rather than NULL when the type has no name.
    const char* typeName = type->m_sTypeName.Get();

    return IsReadableMemory(typeName, 1) ? typeName : NULL;
}

ISchemaSystem* FindSchemaSystem() {
    ISchemaSystem* schemaSystem =
        (ISchemaSystem*)FindInterface(SCHEMA_SYSTEM_LIB_NAME, SCHEMASYSTEM_INTERFACE_VERSION, factory);

    return IsObject(schemaSystem) ? schemaSystem : NULL;
}

bool IsSchemaClassInfo(const CSchemaClassInfo* classInfo) {
    if (!IsReadableMemory(classInfo, sizeof(SchemaClassInfoData_t)) ||
        classInfo->m_nNumFields > MAX_SCHEMA_FIELD_COUNT) {
        return false;
    }

    // A class that only inherits its fields declares none and has no field array to read.
    return classInfo->m_nNumFields == 0 ||
           IsReadableMemory(classInfo->m_pFields, classInfo->m_nNumFields * sizeof(SchemaClassFieldData_t));
}

// The client prefixes most classes it mirrors from the server with C_ (C_BasePlayerPawn for CBasePlayerPawn), but
// player controllers and pawn components keep the server name, so both spellings are tried. A server name class that
// declares no fields doesn't stop the search: the C_ class may be the one that declares them.
CSchemaClassInfo* FindSchemaClass(CSchemaSystemTypeScope* scope, const char* className) {
    if (!IsObject(scope)) {
        return NULL;
    }

    CSchemaClassInfo* classInfo = scope->FindDeclaredClass(className).Get();
    if (!IsSchemaClassInfo(classInfo)) {
        classInfo = NULL;
    }

    if ((classInfo != NULL && classInfo->m_nNumFields > 0) || className[0] != 'C' || className[1] == '_') {
        return classInfo;
    }

    char clientClassName[128];
    snprintf(clientClassName, sizeof(clientClassName), "C_%s", className + 1);
    CSchemaClassInfo* clientClassInfo = scope->FindDeclaredClass(clientClassName).Get();
    if (IsSchemaClassInfo(clientClassInfo) && (classInfo == NULL || clientClassInfo->m_nNumFields > 0)) {
        return clientClassInfo;
    }

    return classInfo;
}

bool ResolveSchemaFields() {
    if (areSchemaFieldsResolved) {
        return true;
    }

    ISchemaSystem* schemaSystem = FindSchemaSystem();
    if (schemaSystem == NULL) {
        if (!hasLoggedSchemaFailure) {
            hasLoggedSchemaFailure = true;
            Log("Schema: %s not found", SCHEMASYSTEM_INTERFACE_VERSION);
        }
        return false;
    }

    CSchemaSystemTypeScope* scope = schemaSystem->FindTypeScopeForModule(CLIENT_SCHEMA_SCOPE_NAME);
    if (!IsObject(scope)) {
        if (!hasLoggedSchemaFailure) {
            hasLoggedSchemaFailure = true;
            Log("Schema: no scope for %s", CLIENT_SCHEMA_SCOPE_NAME);
        }
        return false;
    }

    if (!hasLoggedSchemaScope) {
        hasLoggedSchemaScope = true;
        Log("Schema: scope of %s found", CLIENT_SCHEMA_SCOPE_NAME);
    }

    bool hasEveryRequiredField = true;
    for (int i = 0; i < FIELD_COUNT; i++) {
        SchemaFieldLookup& lookup = schemaFields[i];
        if (lookup.offset != -1) {
            continue;
        }

        CSchemaClassInfo* classInfo = FindSchemaClass(scope, lookup.className);
        if (classInfo != NULL) {
            for (int fieldIndex = 0; fieldIndex < classInfo->m_nNumFields; fieldIndex++) {
                const SchemaClassFieldData_t& field = classInfo->m_pFields[fieldIndex];
                if (IsReadableMemory(field.m_pName, 1) && strcmp(field.m_pName, lookup.fieldName) == 0) {
                    lookup.offset = field.m_nSingleInheritanceOffset;
                    lookup.size = GetFixedArraySize(field);
                    lookup.typeName = GetFieldTypeName(field);
                    break;
                }
            }
        }

        if (lookup.offset == -1 && !lookup.isOptional) {
            hasEveryRequiredField = false;
        }
    }

    if (!hasEveryRequiredField) {
        if (!hasLoggedSchemaFailure) {
            hasLoggedSchemaFailure = true;
            Log("Schema: some fields are missing, the overlay can't follow the spectated player");
            for (int i = 0; i < FIELD_COUNT; i++) {
                const SchemaFieldLookup& lookup = schemaFields[i];
                if (lookup.offset == -1) {
                    Log("Schema: %s::%s not found", lookup.className, lookup.fieldName);
                }
            }
        }
        return false;
    }

    areSchemaFieldsResolved = true;
    Log("Schema: fields resolved");

    return true;
}

int GetSchemaOffset(SchemaFieldId field) { return schemaFields[field].offset; }

int GetSchemaSize(SchemaFieldId field) { return schemaFields[field].size; }

bool IsUtlStringField(SchemaFieldId field) {
    const char* typeName = schemaFields[field].typeName;

    return typeName != NULL && strcmp(typeName, "CUtlString") == 0;
}

const char* GetSchemaClassName(SchemaFieldId field) { return schemaFields[field].className; }

const char* GetSchemaFieldName(SchemaFieldId field) { return schemaFields[field].fieldName; }

void LogSchemaFields() {
    for (int i = 0; i < FIELD_COUNT; i++) {
        const SchemaFieldLookup& lookup = schemaFields[i];
        Log("%s::%s offset: %#x, size: %#x, type: %s", lookup.className, lookup.fieldName, lookup.offset, lookup.size,
            lookup.typeName != NULL ? lookup.typeName : "unknown");
    }
}

#ifdef CSDM_DEV_COMMANDS
// A scope whose name can't be read or doesn't lead back to it, which is what an SDK layout of CSchemaSystem or of the
// scope that no longer matches the game gives.
static bool IsListedScope(ISchemaSystem* schemaSystem, CSchemaSystemTypeScope* scope) {
    if (!IsObject(scope) || !IsReadableMemory(scope->m_szScopeName, sizeof(scope->m_szScopeName))) {
        return false;
    }

    size_t length = strnlen(scope->m_szScopeName, sizeof(scope->m_szScopeName));

    return length > 0 && length < sizeof(scope->m_szScopeName) &&
           schemaSystem->FindTypeScopeForModule(scope->m_szScopeName) == scope;
}

int ListSchemaScopes(CSchemaSystemTypeScope** scopes, int maxCount, int* skippedCount) {
    *skippedCount = 0;
    ISchemaSystem* schemaSystem = FindSchemaSystem();
    if (schemaSystem == NULL || maxCount <= 0) {
        return 0;
    }

    // Found by name, through the game, so it's there even when the scope table can't be walked.
    int count = 0;
    CSchemaSystemTypeScope* clientScope = schemaSystem->FindTypeScopeForModule(CLIENT_SCHEMA_SCOPE_NAME);
    if (IsObject(clientScope)) {
        scopes[count++] = clientScope;
    }

    // m_TypeScopes is a CUtlStringMap, whose first member is the vector of its values.
    CSchemaSystemTypeScope* globalScope = schemaSystem->GlobalTypeScope();
    const CUtlVector<CSchemaSystemTypeScope*>* table =
        (const CUtlVector<CSchemaSystemTypeScope*>*)&static_cast<CSchemaSystem*>(schemaSystem)->m_TypeScopes;
    if (!IsReadableMemory(table, sizeof(*table))) {
        *skippedCount = 1;
        return count;
    }

    int tableCount = table->Count();
    CSchemaSystemTypeScope* const* entries = table->Base();
    if (tableCount < 0 || tableCount > MAX_SCHEMA_SCOPES ||
        (tableCount > 0 && !IsReadableMemory(entries, tableCount * sizeof(CSchemaSystemTypeScope*)))) {
        *skippedCount = 1;
        return count;
    }

    int firstSortedIndex = count;
    for (int i = 0; i < tableCount && count < maxCount; i++) {
        CSchemaSystemTypeScope* scope = entries[i];
        if (scope == clientScope || scope == globalScope) {
            continue;
        }
        if (!IsListedScope(schemaSystem, scope)) {
            (*skippedCount)++;
            continue;
        }

        scopes[count++] = scope;
    }

    std::sort(scopes + firstSortedIndex, scopes + count,
              [](const CSchemaSystemTypeScope* left, const CSchemaSystemTypeScope* right) {
                  return strcmp(left->m_szScopeName, right->m_szScopeName) < 0;
              });

    return count;
}

CSchemaClassInfo* FindSchemaClassInModules(const char* className, const char* moduleName,
                                           const char** foundModuleName) {
    ISchemaSystem* schemaSystem = FindSchemaSystem();
    if (schemaSystem == NULL) {
        Log("Schema system not found");
        return NULL;
    }

    if (moduleName != NULL) {
        CSchemaSystemTypeScope* scope = schemaSystem->FindTypeScopeForModule(moduleName);
        if (!IsObject(scope)) {
            Log("No schema scope for module %s", moduleName);
            return NULL;
        }

        *foundModuleName = moduleName;
        return FindSchemaClass(scope, className);
    }

    CSchemaSystemTypeScope* scopes[MAX_SCHEMA_SCOPES];
    int skippedCount = 0;
    int scopeCount = ListSchemaScopes(scopes, MAX_SCHEMA_SCOPES, &skippedCount);
    for (int i = 0; i < scopeCount; i++) {
        // The server declares many classes of the client under the same name, with the layout of its own entities,
        // which the client's memory doesn't follow (CModelState is 0x290 bytes there, 0x2b0 in the client).
        if (strcmp(scopes[i]->m_szScopeName, SERVER_SCHEMA_SCOPE_NAME) == 0) {
            continue;
        }

        CSchemaClassInfo* classInfo = FindSchemaClass(scopes[i], className);
        if (classInfo != NULL) {
            *foundModuleName = scopes[i]->m_szScopeName;
            return classInfo;
        }
    }

    CSchemaClassInfo* classInfo = FindSchemaClass(schemaSystem->GlobalTypeScope(), className);
    if (classInfo != NULL) {
        *foundModuleName = "global";
    }

    return classInfo;
}
#endif
