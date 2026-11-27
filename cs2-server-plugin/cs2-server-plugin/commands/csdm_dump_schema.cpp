#ifdef CSDM_DEV_COMMANDS

#include <algorithm>
#include <cstdint>
#include <string>
#include <utility>
#include <vector>

#include "icvar.h"
#include "log.h"
#include "memory.h"
#include "schema.h"
#include "schemasystem/schemasystem.h"

static const char* GetTypeName(const SchemaClassFieldData_t& field) {
    const CSchemaType* type = field.m_pType;
    if (!IsObject(type) || !IsReadableMemory(type, sizeof(CSchemaType))) {
        return "?";
    }

    const char* typeName = type->m_sTypeName.Get();

    return IsReadableMemory(typeName, 1) ? typeName : "?";
}

static void DumpClass(const CSchemaClassInfo* classInfo, int baseOffset, int depth) {
    if (depth > 16 || !IsSchemaClassInfo(classInfo)) {
        return;
    }

    const char* name = IsReadableMemory(classInfo->m_pName, 1) ? classInfo->m_pName : "?";
    Log("%*sclass %s at %#x, size %#x, %d fields, %d bases", depth * 2, "", name, baseOffset, classInfo->m_nSizeOf,
        classInfo->m_nNumFields, classInfo->m_nNumBaseClasses);

    if (classInfo->m_nNumBaseClasses > 0 &&
        IsReadableMemory(classInfo->m_pBaseClasses, classInfo->m_nNumBaseClasses * sizeof(SchemaBaseClassInfoData_t))) {
        for (int i = 0; i < classInfo->m_nNumBaseClasses; i++) {
            const SchemaBaseClassInfoData_t& base = classInfo->m_pBaseClasses[i];
            DumpClass(base.m_pClass, baseOffset + (int)base.m_nOffset, depth + 1);
        }
    }

    for (int i = 0; i < classInfo->m_nNumFields; i++) {
        const SchemaClassFieldData_t& field = classInfo->m_pFields[i];
        const char* fieldName = IsReadableMemory(field.m_pName, 1) ? field.m_pName : "?";
        Log("%*s%#06x %s %s", depth * 2 + 2, "", baseOffset + field.m_nSingleInheritanceOffset, GetTypeName(field),
            fieldName);
    }
}

// Mirror of the private layout of CUtlTSHash<CSchemaClassInfo*, 256, uint>, the class bindings of a type scope. It's
// walked by hand because CUtlTSHash::GetElements reads the game's memory unchecked and takes its locks.
struct ClassBindingEntry {
    uint32_t key;
    ClassBindingEntry* next;
    CSchemaClassInfo* classInfo;
};

struct ClassBindingBucket {
    CThreadSpinRWLock addLock;
    ClassBindingEntry* first;
    ClassBindingEntry* firstUncommitted;
};

struct ClassBindings {
    CUtlMemoryPoolBase entryMemory;
    ClassBindingBucket buckets[256];
};

static_assert(sizeof(ClassBindings) <= sizeof(CSchemaSystemTypeScope::m_ClassBindings),
              "ClassBindings doesn't mirror CSchemaSystemTypeScope::m_ClassBindings");

// Stops the walk of a corrupted chain that loops on itself.
constexpr int MAX_CLASS_BINDINGS = 1 << 16;

// Logs the classes declared in the scope, sorted by name.
static void ListClasses(CSchemaSystemTypeScope* scope, const char* scopeName) {
    if (!IsObject(scope)) {
        Log("%s: no schema scope", scopeName);
        return;
    }

    const ClassBindings* bindings = (const ClassBindings*)&scope->m_ClassBindings;
    if (!IsReadableMemory(bindings, sizeof(ClassBindings))) {
        Log("%s: class bindings unreadable", scopeName);
        return;
    }

    std::vector<std::pair<std::string, const CSchemaClassInfo*>> classes;
    int visitedCount = 0;
    int skippedCount = 0;
    for (const ClassBindingBucket& bucket : bindings->buckets) {
        // The uncommitted chain starts with the latest insertions and goes on with the committed ones.
        for (const ClassBindingEntry* entry = bucket.firstUncommitted;
             entry != NULL && visitedCount < MAX_CLASS_BINDINGS; entry = entry->next) {
            visitedCount++;
            if (!IsReadableMemory(entry, sizeof(ClassBindingEntry))) {
                skippedCount++;
                break;
            }

            // A class info always points back to the scope it's declared in, which tells a binding read through a wrong
            // layout apart.
            const CSchemaClassInfo* classInfo = entry->classInfo;
            char name[256];
            if (!IsSchemaClassInfo(classInfo) || classInfo->m_pOuterTypeScope != scope ||
                !ReadString((const uint8_t*)classInfo->m_pName, name, sizeof(name))) {
                skippedCount++;
                continue;
            }

            classes.emplace_back(name, classInfo);
        }
    }

    std::sort(classes.begin(), classes.end(),
              [](const auto& left, const auto& right) { return left.first < right.first; });
    Log("%s: %d classes", scopeName, (int)classes.size());
    for (const auto& [name, classInfo] : classes) {
        Log("  %s, size %#x, %d fields, %d bases", name.c_str(), classInfo->m_nSizeOf, classInfo->m_nNumFields,
            classInfo->m_nNumBaseClasses);
    }

    if (skippedCount > 0) {
        Log("%s: %d bindings skipped, they don't look like classes of this scope. If none was listed, the layout of "
            "CSchemaSystemTypeScope in the SDK may not match the game.",
            scopeName, skippedCount);
    }
}

static void ListAllClasses() {
    ISchemaSystem* schemaSystem = FindSchemaSystem();
    if (schemaSystem == NULL) {
        Log("Schema system not found");
        return;
    }

    CSchemaSystemTypeScope* scopes[MAX_SCHEMA_SCOPES];
    int skippedCount = 0;
    int scopeCount = ListSchemaScopes(scopes, MAX_SCHEMA_SCOPES, &skippedCount);
    Log("%d schema scopes", scopeCount + 1);
    if (skippedCount > 0) {
        Log("%d scope table entries skipped, the layout of CSchemaSystem in the SDK may not match the game",
            skippedCount);
    }

    for (int i = 0; i < scopeCount; i++) {
        ListClasses(scopes[i], scopes[i]->m_szScopeName);
    }
    ListClasses(schemaSystem->GlobalTypeScope(), "global");
}

// Examples, the output goes to the console and csdm.log:
//
//   csdm_dump_schema
//     Lists the classes of every schema scope, the client first, the global scope last:
//       21 schema scopes
//       client.dll: 511 classes
//         C_CSPlayerPawn, size 0x3750, 105 fields, 1 bases
//         ...
//       animationsystem.dll: 65 classes
//       ...
//       server.dll: 750 classes
//       ...
//       global: 1808 classes
//
//   csdm_dump_schema CCSPlayerPawn
//     Prints the fields of the class and of its bases, with their offset and type. The C_ class of the client is tried
//     when the class has no fields under that name, here C_CSPlayerPawn. Every scope is searched but the server's.
//
//   csdm_dump_schema CCSPlayerPawn server.dll
//     Looks the class up in that module only, libserver.so on Linux. The only way to get the server's classes, which
//     share names with the client's but not their layout.
//
// From the CLI, at the repository root:
//   node out/cli.js watch <demo.dem> --exec 200:csdm_dump_schema --exec 300:quit
CON_COMMAND(csdm_dump_schema,
            "Prints the fields of a schema class, or lists every class without one, usage: csdm_dump_schema [class] "
            "[module]") {
    if (args.ArgC() < 2) {
        ListAllClasses();
        return;
    }

    const char* moduleName = NULL;
    CSchemaClassInfo* classInfo =
        FindSchemaClassInModules(args.Arg(1), args.ArgC() > 2 ? args.Arg(2) : NULL, &moduleName);
    if (classInfo == NULL) {
        Log("Schema class %s not found", args.Arg(1));
        return;
    }

    Log("Schema class %s found in %s", args.Arg(1), moduleName);
    DumpClass(classInfo, 0, 0);
}

#endif
