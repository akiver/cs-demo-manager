#include "schema.h"

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
#else
#define SCHEMA_SYSTEM_LIB_NAME "libschemasystem.so"
#define CLIENT_SCHEMA_SCOPE_NAME "libclient.so"
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

static bool IsSchemaClassInfo(const CSchemaClassInfo* classInfo) {
    return IsReadableMemory(classInfo, sizeof(SchemaClassInfoData_t)) &&
           classInfo->m_nNumFields <= MAX_SCHEMA_FIELD_COUNT &&
           IsReadableMemory(classInfo->m_pFields, classInfo->m_nNumFields * sizeof(SchemaClassFieldData_t));
}

// The client prefixes most classes it mirrors from the server with C_ (C_BasePlayerPawn for CBasePlayerPawn), but
// player controllers and pawn components keep the server name, so both spellings are tried.
static CSchemaClassInfo* FindSchemaClass(CSchemaSystemTypeScope* scope, const char* className) {
    CSchemaClassInfo* classInfo = scope->FindDeclaredClass(className).Get();
    if (IsSchemaClassInfo(classInfo)) {
        return classInfo;
    }

    if (className[0] != 'C' || className[1] == '_') {
        return NULL;
    }

    char clientClassName[128];
    snprintf(clientClassName, sizeof(clientClassName), "C_%s", className + 1);
    classInfo = scope->FindDeclaredClass(clientClassName).Get();

    return IsSchemaClassInfo(classInfo) ? classInfo : NULL;
}

bool ResolveSchemaFields() {
    if (areSchemaFieldsResolved) {
        return true;
    }

    ISchemaSystem* schemaSystem =
        (ISchemaSystem*)FindInterface(SCHEMA_SYSTEM_LIB_NAME, SCHEMASYSTEM_INTERFACE_VERSION, factory);
    if (!IsObject(schemaSystem)) {
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
