#ifdef CSDM_DEV_COMMANDS

// Dev commands to explore how the models of the players and their hitboxes are laid out in memory.

#include <cctype>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>

#include "cdll_interfaces.h"
#include "entity_system.h"
#include "icvar.h"
#include "interface.h"
#include "library.h"
#include "log.h"
#include "memory.h"
#include "player_controllers.h"
#include "plugin.h"
#include "schema.h"
#include "schemasystem/schemasystem.h"

#ifdef _WIN32
#define CompareIgnoringCase _stricmp
static const char* schemaModules[] = {"client.dll",         "animationsystem.dll", "meshsystem.dll",   "modellib.dll",
                                      "resourcesystem.dll", "scenesystem.dll",     "worldrenderer.dll"};
#else
#include <strings.h>
#define CompareIgnoringCase strcasecmp
static const char* schemaModules[] = {"libclient.so",       "libanimationsystem.so", "libmeshsystem.so",
                                      "libmodellib.so",     "libresourcesystem.so",  "libscenesystem.so",
                                      "libworldrenderer.so"};
#endif

// Finds the class in the given module, or in the first module that declares it.
static CSchemaClassInfo* FindClass(const char* className, const char* moduleName, const char** foundModuleName) {
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

    for (const char* module : schemaModules) {
        CSchemaClassInfo* classInfo = FindSchemaClass(schemaSystem->FindTypeScopeForModule(module), className);
        if (classInfo != NULL) {
            *foundModuleName = module;
            return classInfo;
        }
    }

    CSchemaClassInfo* classInfo = FindSchemaClass(schemaSystem->GlobalTypeScope(), className);
    if (classInfo != NULL) {
        *foundModuleName = "global";
    }

    return classInfo;
}

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

// Offset of the field in the class or one of its bases, -1 when not found.
static int FindFieldOffset(const CSchemaClassInfo* classInfo, const char* fieldName, int depth = 0) {
    if (depth > 16 || !IsSchemaClassInfo(classInfo)) {
        return -1;
    }

    for (int i = 0; i < classInfo->m_nNumFields; i++) {
        const SchemaClassFieldData_t& field = classInfo->m_pFields[i];
        if (IsReadableMemory(field.m_pName, 1) && strcmp(field.m_pName, fieldName) == 0) {
            return field.m_nSingleInheritanceOffset;
        }
    }

    if (classInfo->m_nNumBaseClasses > 0 &&
        IsReadableMemory(classInfo->m_pBaseClasses, classInfo->m_nNumBaseClasses * sizeof(SchemaBaseClassInfoData_t))) {
        for (int i = 0; i < classInfo->m_nNumBaseClasses; i++) {
            const SchemaBaseClassInfoData_t& base = classInfo->m_pBaseClasses[i];
            int offset = FindFieldOffset(base.m_pClass, fieldName, depth + 1);
            if (offset != -1) {
                return (int)base.m_nOffset + offset;
            }
        }
    }

    return -1;
}

static int FindFieldOffset(const char* className, const char* fieldName) {
    const char* moduleName = NULL;
    int offset = FindFieldOffset(FindClass(className, NULL, &moduleName), fieldName);
    if (offset == -1) {
        Log("%s::%s not found", className, fieldName);
    }

    return offset;
}

// Looks the field up while its offset is still missing.
static void ResolveFieldOffset(int* offset, const char* className, const char* fieldName) {
    if (*offset == -1) {
        *offset = FindFieldOffset(className, fieldName);
    }
}

static void LogMissingSchemaField(SchemaFieldId field) {
    Log("%s::%s not found", GetSchemaClassName(field), GetSchemaFieldName(field));
}

static const uint8_t* ReadPointer(const void* address) {
    if (!IsReadableMemory(address, sizeof(void*))) {
        return NULL;
    }

    const uint8_t* pointer = *(const uint8_t* const*)address;

    return IsPlausiblePointer(pointer) ? pointer : NULL;
}

// The pawn handle of the controller, invalid when it can't be read.
static CEntityHandle ReadPawnHandle(const CEntityIdentity* controllerIdentity, int pawnHandleOffset) {
    const uint8_t* address = (const uint8_t*)controllerIdentity->m_pInstance + pawnHandleOffset;
    if (!IsReadableMemory(address, sizeof(CEntityHandle))) {
        return CEntityHandle();
    }

    return *(const CEntityHandle*)address;
}

// The pointer to a string stored at the address. Strings start at any byte, unlike the objects ReadPointer accepts, so
// the alignment isn't checked: ReadString checks that the target can be read.
static const uint8_t* ReadStringPointer(const void* address) {
    if (!IsReadableMemory(address, sizeof(void*))) {
        return NULL;
    }

    return *(const uint8_t* const*)address;
}

// The string at the address when it looks like a printable C string of at least 3 characters.
static bool ReadString(const uint8_t* address, char* string, size_t size) {
    if (address == NULL || !IsReadableMemory(address, 4)) {
        return false;
    }

    size_t length = 0;
    while (length < size - 1 && IsReadableMemory(address + length, 1) && address[length] != 0) {
        if (!isprint(address[length])) {
            return false;
        }
        string[length] = (char)address[length];
        length++;
    }
    string[length] = 0;

    return length >= 3;
}

// Logs each 8-byte slot of the memory with what it looks like: a pointer to a string, a pointer, or 2 floats/ints.
static void DumpMemory(const char* label, const uint8_t* address, int size) {
    Log("%s at %p:", label, address);
    for (int offset = 0; offset < size; offset += 8) {
        const uint8_t* slot = address + offset;
        if (!IsReadableMemory(slot, 8)) {
            Log("  +%#05x unreadable", offset);
            return;
        }

        uint64_t value = *(const uint64_t*)slot;
        const uint8_t* pointer = (const uint8_t*)value;
        char string[96];
        if (ReadString(pointer, string, sizeof(string))) {
            Log("  +%#05x %p -> \"%s\"", offset, pointer, string);
        } else if (IsPlausiblePointer(pointer) && IsReadableMemory(pointer, 8)) {
            const uint8_t* target = ReadStringPointer(pointer);
            if (ReadString(target, string, sizeof(string))) {
                Log("  +%#05x %p -> %p -> \"%s\"", offset, pointer, target, string);
            } else {
                Log("  +%#05x %p (pointer)", offset, pointer);
            }
        } else {
            const float* floats = (const float*)slot;
            const int32_t* ints = (const int32_t*)slot;
            Log("  +%#05x %016llx  f(%g, %g)  i(%d, %d)", offset, (unsigned long long)value, floats[0], floats[1],
                ints[0], ints[1]);
        }
    }
}

// How the hitboxes of a player are found. The fields the schema lists are looked up by name, the offsets below are the
// ones of members it doesn't list, found with csdm_dump_pawn_model:
// - The scene node of the pawn holds a CModelState. Ahead of m_hModel, its first schema field, it points to the
//   world-space transforms of the bones, one per bone: a position, a scale, then a rotation quaternion.
// - m_hModel leads to the model, which holds its name, the names of its bones, in the order of the transforms, and its
//   render meshes: their count, then a pointer to them. Only the first mesh is read.
// - The mesh keeps its hitbox sets in a map: the pointer leads to the first node, where the CHitBoxSet comes after the
//   links of the node and its key, the name of the set. Only that set is read.
// - Each CHitBox of the set names its bone, which gives the index of its transform, and holds the two ends of its
//   capsule in the space of that bone.
// The counts read from the game are checked against the limits: a larger one means an offset has moved.
constexpr int MODEL_STATE_BONES_OFFSET = 0x80;
constexpr int MODEL_NAME_OFFSET = 0x8;
constexpr int MODEL_BONE_COUNT_OFFSET = 0x160;
constexpr int MODEL_BONE_NAMES_OFFSET = 0x168;
constexpr int MODEL_MESH_COUNT_OFFSET = 0x70;
constexpr int MODEL_MESHES_OFFSET = 0x78;
constexpr int MESH_HITBOX_SETS_OFFSET = 0x168;
constexpr int HITBOX_SET_NODE_VALUE_OFFSET = 0x18;
constexpr int BONE_TRANSFORM_SIZE = 32;
constexpr int MAX_HITBOXES = 64;
constexpr int MAX_BONES = 512;

// Sizes of the game's CHitBox and CHitBoxSet and offsets of their fields, read from the schema so they follow game
// updates.
struct HitBoxLayout {
    int size;
    int name;
    int boneName;
    int minBounds;
    int maxBounds;
    int radius;
    int groupId;
    int shapeType;
};

struct HitBoxSetLayout {
    int size;
    int name;
    int hitBoxes;
};

// No hitbox or hitbox set comes near that size, a larger one means the class info isn't the one of the class.
constexpr int MAX_HITBOX_CLASS_SIZE = 0x400;
// A vector starts with the number of its elements, the pointer to them comes after.
constexpr int VECTOR_ELEMENTS_OFFSET = 8;
constexpr int VECTOR_HEADER_SIZE = 16;

static HitBoxLayout hitBoxLayout;
static HitBoxSetLayout hitBoxSetLayout;
static bool areHitBoxLayoutsResolved = false;

// The class when its size is plausible, NULL otherwise.
static const CSchemaClassInfo* FindLayoutClass(const char* className, const char** moduleName) {
    const CSchemaClassInfo* classInfo = FindClass(className, NULL, moduleName);
    if (classInfo == NULL) {
        Log("Schema class %s not found", className);
        return NULL;
    }

    if (classInfo->m_nSizeOf <= 0 || classInfo->m_nSizeOf > MAX_HITBOX_CLASS_SIZE) {
        Log("Unexpected %s size %d", className, classInfo->m_nSizeOf);
        return NULL;
    }

    return classInfo;
}

// Offset of a field of the class, false when the field is missing or doesn't fit in the class.
static bool FindLayoutField(const CSchemaClassInfo* classInfo, const char* className, const char* fieldName,
                            int fieldSize, int* offset) {
    *offset = FindFieldOffset(classInfo, fieldName);
    if (*offset < 0 || *offset + fieldSize > classInfo->m_nSizeOf) {
        Log("%s::%s not found", className, fieldName);
        return false;
    }

    return true;
}

// Looked up again while missing, the schema may not be ready the first time.
static bool ResolveHitBoxLayouts() {
    if (areHitBoxLayoutsResolved) {
        return true;
    }

    const char* hitBoxModule = NULL;
    const char* hitBoxSetModule = NULL;
    const CSchemaClassInfo* hitBox = FindLayoutClass("CHitBox", &hitBoxModule);
    const CSchemaClassInfo* hitBoxSet = FindLayoutClass("CHitBoxSet", &hitBoxSetModule);
    if (hitBox == NULL || hitBoxSet == NULL) {
        return false;
    }

    // The names are strings held by a pointer, the bounds vectors of 3 floats.
    HitBoxLayout layout;
    layout.size = hitBox->m_nSizeOf;
    HitBoxSetLayout setLayout;
    setLayout.size = hitBoxSet->m_nSizeOf;
    if (!FindLayoutField(hitBox, "CHitBox", "m_name", sizeof(void*), &layout.name) ||
        !FindLayoutField(hitBox, "CHitBox", "m_sBoneName", sizeof(void*), &layout.boneName) ||
        !FindLayoutField(hitBox, "CHitBox", "m_vMinBounds", 3 * sizeof(float), &layout.minBounds) ||
        !FindLayoutField(hitBox, "CHitBox", "m_vMaxBounds", 3 * sizeof(float), &layout.maxBounds) ||
        !FindLayoutField(hitBox, "CHitBox", "m_flShapeRadius", sizeof(float), &layout.radius) ||
        !FindLayoutField(hitBox, "CHitBox", "m_nGroupId", sizeof(int32_t), &layout.groupId) ||
        !FindLayoutField(hitBox, "CHitBox", "m_nShapeType", sizeof(uint8_t), &layout.shapeType) ||
        !FindLayoutField(hitBoxSet, "CHitBoxSet", "m_name", sizeof(void*), &setLayout.name) ||
        !FindLayoutField(hitBoxSet, "CHitBoxSet", "m_HitBoxes", VECTOR_HEADER_SIZE, &setLayout.hitBoxes)) {
        return false;
    }

    hitBoxLayout = layout;
    hitBoxSetLayout = setLayout;
    areHitBoxLayoutsResolved = true;
    Log("CHitBox found in %s: size %#x, name %#x, bone name %#x, bounds %#x and %#x, radius %#x, group %#x, shape %#x",
        hitBoxModule, layout.size, layout.name, layout.boneName, layout.minBounds, layout.maxBounds, layout.radius,
        layout.groupId, layout.shapeType);
    Log("CHitBoxSet found in %s: size %#x, name %#x, hitboxes %#x", hitBoxSetModule, setLayout.size, setLayout.name,
        setLayout.hitBoxes);

    return true;
}

// Bone names of the model being searched, to recognize a CHitBox by its bone.
static char searchBoneNames[128][96];
static int searchBoneCount = 0;
static const uint8_t* visitedNodes[8192];
static int visitedNodeCount = 0;
static int foundHitboxVectorCount = 0;

// Hitboxes name their bone in lowercase, the skeleton keeps the case of the model.
static bool IsBoneName(const char* name) {
    for (int i = 0; i < searchBoneCount; i++) {
        if (CompareIgnoringCase(searchBoneNames[i], name) == 0) {
            return true;
        }
    }

    return false;
}

static bool LooksLikeHitBox(const uint8_t* hitbox) {
    if (!IsReadableMemory(hitbox, hitBoxLayout.size)) {
        return false;
    }

    char boneName[96];
    if (!ReadString(ReadStringPointer(hitbox + hitBoxLayout.boneName), boneName, sizeof(boneName)) ||
        !IsBoneName(boneName)) {
        return false;
    }

    float radius = *(const float*)(hitbox + hitBoxLayout.radius);

    return radius >= 0 && radius < 50;
}

static void LogHitBoxes(const uint8_t* hitboxes, int count) {
    for (int i = 0; i < count; i++) {
        const uint8_t* hitbox = hitboxes + i * hitBoxLayout.size;
        if (!IsReadableMemory(hitbox, hitBoxLayout.size)) {
            Log("  hitbox %d unreadable", i);
            return;
        }

        char hitboxName[96] = "?";
        char boneName[96] = "?";
        ReadString(ReadStringPointer(hitbox + hitBoxLayout.name), hitboxName, sizeof(hitboxName));
        ReadString(ReadStringPointer(hitbox + hitBoxLayout.boneName), boneName, sizeof(boneName));
        const float* min = (const float*)(hitbox + hitBoxLayout.minBounds);
        const float* max = (const float*)(hitbox + hitBoxLayout.maxBounds);
        Log("  %s bone %s min %g %g %g max %g %g %g radius %g group %d shape %d", hitboxName, boneName, min[0], min[1],
            min[2], max[0], max[1], max[2], *(const float*)(hitbox + hitBoxLayout.radius),
            *(const int32_t*)(hitbox + hitBoxLayout.groupId), *(const uint8_t*)(hitbox + hitBoxLayout.shapeType));
    }
}

// Searches the memory reachable from the node for a vector of CHitBox or CHitBoxSet, and logs the path to it.
static void SearchHitBoxes(const uint8_t* node, int depth, char* path, size_t pathLength) {
    for (int i = 0; i < visitedNodeCount; i++) {
        if (visitedNodes[i] == node) {
            return;
        }
    }
    if (visitedNodeCount >= (int)(sizeof(visitedNodes) / sizeof(visitedNodes[0])) || foundHitboxVectorCount > 8) {
        return;
    }
    visitedNodes[visitedNodeCount++] = node;

    for (int offset = 0; offset < 0x600; offset += 8) {
        const uint8_t* slot = node + offset;
        if (!IsReadableMemory(slot, VECTOR_HEADER_SIZE)) {
            break;
        }

        int count = *(const int32_t*)slot;
        const uint8_t* elements = ReadPointer(slot + VECTOR_ELEMENTS_OFFSET);
        if (count >= 1 && count <= 128 && elements != NULL) {
            if (LooksLikeHitBox(elements)) {
                foundHitboxVectorCount++;
                Log("CHitBox vector at %s+%#x, %d hitboxes", path, offset, count);
                LogHitBoxes(elements, count);
                continue;
            }

            char setName[96];
            const uint8_t* setHitBoxes = elements + hitBoxSetLayout.hitBoxes;
            const uint8_t* hitboxes = IsReadableMemory(elements, hitBoxSetLayout.size)
                                          ? ReadPointer(setHitBoxes + VECTOR_ELEMENTS_OFFSET)
                                          : NULL;
            if (count <= 8 &&
                ReadString(ReadStringPointer(elements + hitBoxSetLayout.name), setName, sizeof(setName)) &&
                hitboxes != NULL && LooksLikeHitBox(hitboxes)) {
                foundHitboxVectorCount++;
                int hitboxCount = *(const int32_t*)setHitBoxes;
                Log("CHitBoxSet vector at %s+%#x, %d sets, first \"%s\" with %d hitboxes", path, offset, count, setName,
                    hitboxCount);
                LogHitBoxes(hitboxes, hitboxCount > 128 ? 0 : hitboxCount);
                continue;
            }
        }

        const uint8_t* child = ReadPointer(slot);
        if (depth > 0 && child != NULL) {
            size_t length = strlen(path);
            snprintf(path + length, pathLength - length, "+%#x>", offset);
            SearchHitBoxes(child, depth - 1, path, pathLength);
            path[length] = 0;
        }
    }
}

CON_COMMAND(csdm_dump_schema, "Prints the fields of a schema class, usage: csdm_dump_schema <class> [module]") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_dump_schema <class> [module]");
        return;
    }

    const char* moduleName = NULL;
    CSchemaClassInfo* classInfo = FindClass(args.Arg(1), args.ArgC() > 2 ? args.Arg(2) : NULL, &moduleName);
    if (classInfo == NULL) {
        Log("Schema class %s not found", args.Arg(1));
        return;
    }

    Log("Schema class %s found in %s", args.Arg(1), moduleName);
    DumpClass(classInfo, 0, 0);
}

static CEntityIdentity* FindPawn(int slot) {
    uint8_t* entitySystem = GetEntitySystem();
    if (entitySystem == NULL) {
        Log("No entity system");
        return NULL;
    }

    PlayerController controllers[maxPlayerSlots];
    int count = ListPlayerControllers(controllers, maxPlayerSlots);
    const PlayerController* controller = NULL;
    for (int i = 0; i < count; i++) {
        if (!controllers[i].isHltv && controllers[i].steamId != 0 && controllers[i].isAlive &&
            (slot < 0 || controllers[i].entityIndex - 1 == slot)) {
            controller = &controllers[i];
            break;
        }
    }

    if (controller == NULL) {
        Log("No alive player found");
        return NULL;
    }

    CEntityIdentity* controllerIdentity = FindPlayerController(controller->entityIndex, controller->steamId);
    if (controllerIdentity == NULL) {
        Log("No controller for %s", controller->name);
        return NULL;
    }

    int pawnHandleOffset = GetSchemaOffset(FIELD_CONTROLLER_PLAYER_PAWN);
    if (pawnHandleOffset == -1) {
        LogMissingSchemaField(FIELD_CONTROLLER_PLAYER_PAWN);
        return NULL;
    }

    CEntityHandle handle = ReadPawnHandle(controllerIdentity, pawnHandleOffset);
    if (!handle.IsValid()) {
        Log("Invalid pawn handle");
        return NULL;
    }

    Log("Player %s, slot %d, pawn entity %d", controller->name, controller->entityIndex - 1, handle.GetEntryIndex());

    CEntityIdentity* pawn = GetEntityIdentity(entitySystem, handle.GetEntryIndex());
    if (pawn == NULL) {
        Log("No pawn at entity %d", handle.GetEntryIndex());
    }

    return pawn;
}

CON_COMMAND(csdm_dump_pawn_model,
            "Prints how the model of a player is laid out in memory, usage: csdm_dump_pawn_model [slot]") {
    int slot = args.ArgC() > 1 ? atoi(args.Arg(1)) : -1;
    CEntityIdentity* pawn = FindPawn(slot);
    if (pawn == NULL) {
        return;
    }

    const uint8_t* instance = (const uint8_t*)pawn->m_pInstance;
    int sceneNodeOffset = GetSchemaOffset(FIELD_GAME_SCENE_NODE);
    int originOffset = GetSchemaOffset(FIELD_SCENE_NODE_ABS_ORIGIN);
    int modelStateOffset = FindFieldOffset("CSkeletonInstance", "m_modelState");
    int modelHandleOffset = FindFieldOffset("CModelState", "m_hModel");
    int modelNameOffset = FindFieldOffset("CModelState", "m_ModelName");
    if (sceneNodeOffset == -1) {
        LogMissingSchemaField(FIELD_GAME_SCENE_NODE);
    }
    if (originOffset == -1) {
        LogMissingSchemaField(FIELD_SCENE_NODE_ABS_ORIGIN);
    }
    // FindFieldOffset already logged the fields it didn't find.
    if (sceneNodeOffset == -1 || originOffset == -1 || modelStateOffset == -1 || modelHandleOffset == -1) {
        return;
    }

    const uint8_t* sceneNode = ReadPointer(instance + sceneNodeOffset);
    if (sceneNode == NULL || !IsReadableMemory(sceneNode + originOffset, 12)) {
        Log("No scene node");
        return;
    }

    const float* origin = (const float*)(sceneNode + originOffset);
    Log("Origin: %g %g %g", origin[0], origin[1], origin[2]);

    const uint8_t* modelState = sceneNode + modelStateOffset;
    DumpMemory("Model state", modelState, 0x100);

    char modelName[256] = {};
    if (modelNameOffset != -1 &&
        ReadString(ReadStringPointer(modelState + modelNameOffset), modelName, sizeof(modelName))) {
        Log("Model name: %s", modelName);
    }

    const uint8_t* modelBinding = ReadPointer(modelState + modelHandleOffset);
    const uint8_t* model = ReadPointer(modelBinding);
    if (model == NULL) {
        Log("No model behind the handle %p", modelBinding);
        return;
    }

    // Bone names, a vector of strings found in the model by the first dump: its count, then a pointer to the names.
    int boneCount =
        IsReadableMemory(model + MODEL_BONE_COUNT_OFFSET, 4) ? *(const int32_t*)(model + MODEL_BONE_COUNT_OFFSET) : 0;
    const uint8_t* boneNames = ReadPointer(model + MODEL_BONE_NAMES_OFFSET);
    // The names stay at their bone index, "?" for the ones that can't be read, a valid name is never that short.
    searchBoneCount = 0;
    int readNameCount = 0;
    for (int i = 0; i < boneCount && i < 128 && boneNames != NULL; i++) {
        if (ReadString(ReadStringPointer(boneNames + i * 8), searchBoneNames[i], sizeof(searchBoneNames[i]))) {
            readNameCount++;
        } else {
            snprintf(searchBoneNames[i], sizeof(searchBoneNames[i]), "?");
        }
        searchBoneCount++;
    }
    Log("Bones: %d, %d names read", boneCount, readNameCount);

    // The bone transforms in world space, found in the model state by the previous dump.
    const uint8_t* bones = ReadPointer(modelState + MODEL_STATE_BONES_OFFSET);
    for (int i = 0; i < searchBoneCount && bones != NULL && i < 30; i++) {
        const float* transform = (const float*)(bones + i * BONE_TRANSFORM_SIZE);
        if (!IsReadableMemory(transform, BONE_TRANSFORM_SIZE)) {
            break;
        }
        Log("  bone %d %s pos %g %g %g scale %g rot %g %g %g %g", i, searchBoneNames[i], transform[0], transform[1],
            transform[2], transform[3], transform[4], transform[5], transform[6], transform[7]);
    }

    // The search recognizes the hitboxes and their sets by the fields of CHitBox and CHitBoxSet.
    if (!ResolveHitBoxLayouts()) {
        return;
    }

    visitedNodeCount = 0;
    foundHitboxVectorCount = 0;
    char path[512];
    int meshCount =
        IsReadableMemory(model + MODEL_MESH_COUNT_OFFSET, 4) ? *(const int32_t*)(model + MODEL_MESH_COUNT_OFFSET) : 0;
    const uint8_t* meshes = ReadPointer(model + MODEL_MESHES_OFFSET);
    Log("Meshes: %d at %p", meshCount, meshes);
    for (int meshIndex = 0; meshIndex < meshCount && meshIndex < 16 && meshes != NULL; meshIndex++) {
        const uint8_t* mesh = ReadPointer(meshes + meshIndex * 8);
        if (mesh == NULL) {
            continue;
        }

        DumpMemory("Mesh", mesh, 0x200);
        snprintf(path, sizeof(path), "mesh%d>", meshIndex);
        SearchHitBoxes(mesh, 1, path, sizeof(path));
        Log("Mesh %d searched, %d nodes, %d hitbox vectors found", meshIndex, visitedNodeCount, foundHitboxVectorCount);
    }
}

struct ModelHitboxes {
    const uint8_t* model;
    char name[256];
    int boneCount;
    int hitboxCount;
    const uint8_t* hitboxes;
    int boneIndices[MAX_HITBOXES];
    bool isDescribed;
};

static ModelHitboxes modelHitboxes[32];
static int modelHitboxesCount = 0;

// Reads the skeleton and the first hitbox set of the model, false when the model memory doesn't look like a model.
static bool ReadModelHitboxSet(const uint8_t* model, int* boneCount, const uint8_t** boneNames, int* hitboxCount,
                               const uint8_t** hitboxes) {
    *boneCount =
        IsReadableMemory(model + MODEL_BONE_COUNT_OFFSET, 4) ? *(const int32_t*)(model + MODEL_BONE_COUNT_OFFSET) : 0;
    *boneNames = ReadPointer(model + MODEL_BONE_NAMES_OFFSET);
    const uint8_t* meshes = ReadPointer(model + MODEL_MESHES_OFFSET);
    const uint8_t* mesh = ReadPointer(meshes);
    const uint8_t* node = mesh != NULL ? ReadPointer(mesh + MESH_HITBOX_SETS_OFFSET) : NULL;
    if (*boneCount <= 0 || *boneCount > MAX_BONES || *boneNames == NULL || node == NULL ||
        !IsReadableMemory(node + HITBOX_SET_NODE_VALUE_OFFSET, hitBoxSetLayout.size)) {
        return false;
    }

    const uint8_t* setHitBoxes = node + HITBOX_SET_NODE_VALUE_OFFSET + hitBoxSetLayout.hitBoxes;
    *hitboxCount = *(const int32_t*)setHitBoxes;
    *hitboxes = ReadPointer(setHitBoxes + VECTOR_ELEMENTS_OFFSET);
    return *hitboxCount > 0 && *hitboxCount <= MAX_HITBOXES && *hitboxes != NULL &&
           IsReadableMemory(*hitboxes, *hitboxCount * hitBoxLayout.size);
}

static bool ResolveModelHitboxes(const uint8_t* model, ModelHitboxes* result) {
    int boneCount, hitboxCount;
    const uint8_t *boneNames, *hitboxes;
    if (!ReadModelHitboxSet(model, &boneCount, &boneNames, &hitboxCount, &hitboxes)) {
        return false;
    }

    // Read once for all the hitboxes, each name is read byte by byte. Static as it's too large for the stack, empty
    // for the names that can't be read so they match no hitbox.
    static char modelBoneNames[MAX_BONES][96];
    for (int bone = 0; bone < boneCount; bone++) {
        if (!ReadString(ReadStringPointer(boneNames + bone * 8), modelBoneNames[bone], sizeof(modelBoneNames[bone]))) {
            modelBoneNames[bone][0] = 0;
        }
    }

    // Hitboxes name their bone in lowercase, the skeleton keeps the case of the model.
    for (int i = 0; i < hitboxCount; i++) {
        char hitboxBone[96];
        const uint8_t* hitbox = hitboxes + i * hitBoxLayout.size;
        if (!ReadString(ReadStringPointer(hitbox + hitBoxLayout.boneName), hitboxBone, sizeof(hitboxBone))) {
            return false;
        }

        result->boneIndices[i] = -1;
        for (int bone = 0; bone < boneCount; bone++) {
            if (CompareIgnoringCase(modelBoneNames[bone], hitboxBone) == 0) {
                result->boneIndices[i] = bone;
                break;
            }
        }

        if (result->boneIndices[i] == -1) {
            Log("Bone %s of hitbox %d not found", hitboxBone, i);
            return false;
        }
    }

    result->model = model;
    result->boneCount = boneCount;
    result->hitboxCount = hitboxCount;
    result->hitboxes = hitboxes;
    result->isDescribed = false;

    return true;
}

// A cached model can be freed when another demo or map loads and its address reused by another model or other data.
static bool IsCachedModelValid(const ModelHitboxes* cached, const char* modelName) {
    int boneCount, hitboxCount;
    const uint8_t *boneNames, *hitboxes;
    return strcmp(cached->name, modelName) == 0 &&
           ReadModelHitboxSet(cached->model, &boneCount, &boneNames, &hitboxCount, &hitboxes) &&
           boneCount == cached->boneCount && hitboxCount == cached->hitboxCount && hitboxes == cached->hitboxes;
}

// Models of the previous demos or maps stay in the cache at addresses that are never seen again.
static void EvictStaleModelHitboxes() {
    for (int i = modelHitboxesCount - 1; i >= 0; i--) {
        char name[256];
        if (!ReadString(ReadStringPointer(modelHitboxes[i].model + MODEL_NAME_OFFSET), name, sizeof(name)) ||
            !IsCachedModelValid(&modelHitboxes[i], name)) {
            modelHitboxes[i] = modelHitboxes[--modelHitboxesCount];
        }
    }

    if (modelHitboxesCount >= (int)(sizeof(modelHitboxes) / sizeof(modelHitboxes[0]))) {
        Log("Hitbox cache full, clearing it");
        modelHitboxesCount = 0;
    }
}

static ModelHitboxes* GetModelHitboxes(const uint8_t* model, const char* modelName) {
    ModelHitboxes* result = NULL;
    for (int i = 0; i < modelHitboxesCount; i++) {
        if (modelHitboxes[i].model == model) {
            if (IsCachedModelValid(&modelHitboxes[i], modelName)) {
                return &modelHitboxes[i];
            }

            Log("Hitboxes of %s are stale, resolving them again", modelHitboxes[i].name);
            result = &modelHitboxes[i];
            break;
        }
    }

    if (result == NULL) {
        if (modelHitboxesCount >= (int)(sizeof(modelHitboxes) / sizeof(modelHitboxes[0]))) {
            EvictStaleModelHitboxes();
        }
        result = &modelHitboxes[modelHitboxesCount++];
    }

    if (!ResolveModelHitboxes(model, result)) {
        Log("Hitboxes of %s not found", modelName);
        // Drop the slot, it may hold a half-written entry.
        *result = modelHitboxes[--modelHitboxesCount];
        return NULL;
    }

    snprintf(result->name, sizeof(result->name), "%s", modelName);

    return result;
}

// Transforms a point of the bone's space with its world transform: position, scale, then a quaternion (x, y, z, w).
static void TransformPoint(const float* transform, const float* point, float* result) {
    const float* q = transform + 4;
    float scale = transform[3];
    float v[3] = {point[0] * scale, point[1] * scale, point[2] * scale};
    // v' = v + 2 * cross(q, cross(q, v) + w * v)
    float c1[3] = {q[1] * v[2] - q[2] * v[1] + q[3] * v[0], q[2] * v[0] - q[0] * v[2] + q[3] * v[1],
                   q[0] * v[1] - q[1] * v[0] + q[3] * v[2]};
    float c2[3] = {q[1] * c1[2] - q[2] * c1[1], q[2] * c1[0] - q[0] * c1[2], q[0] * c1[1] - q[1] * c1[0]};
    for (int i = 0; i < 3; i++) {
        result[i] = transform[i] + v[i] + 2 * c2[i];
    }
}

// ReadString only accepts printable characters, so the quote and the backslash are the only ones to escape.
static void WriteJsonString(FILE* file, const char* string) {
    fputc('"', file);
    for (const char* c = string; *c != 0; c++) {
        if (*c == '"' || *c == '\\') {
            fputc('\\', file);
        }
        fputc(*c, file);
    }
    fputc('"', file);
}

// Comma-separated numbers, null for the NaN and infinite values JSON has no literal for.
static void WriteJsonFloats(FILE* file, const float* values, int count, const char* format) {
    for (int i = 0; i < count; i++) {
        if (i > 0) {
            fputc(',', file);
        }
        if (std::isfinite(values[i])) {
            fprintf(file, format, values[i]);
        } else {
            fputs("null", file);
        }
    }
}

static void DescribeModel(FILE* file, ModelHitboxes* hitboxes) {
    fputs("{\"type\":\"model\",\"model\":", file);
    WriteJsonString(file, hitboxes->name);
    fputs(",\"hitboxes\":[", file);
    for (int i = 0; i < hitboxes->hitboxCount; i++) {
        const uint8_t* hitbox = hitboxes->hitboxes + i * hitBoxLayout.size;
        char name[96] = "?";
        if (!ReadString(ReadStringPointer(hitbox + hitBoxLayout.name), name, sizeof(name))) {
            snprintf(name, sizeof(name), "?");
        }
        fputs(i > 0 ? ",{\"name\":" : "{\"name\":", file);
        WriteJsonString(file, name);
        fprintf(file, ",\"bone\":%d,\"group\":%d,\"shape\":%d,\"radius\":", hitboxes->boneIndices[i],
                *(const int32_t*)(hitbox + hitBoxLayout.groupId), *(const uint8_t*)(hitbox + hitBoxLayout.shapeType));
        WriteJsonFloats(file, (const float*)(hitbox + hitBoxLayout.radius), 1, "%g");
        fputs(",\"min\":[", file);
        WriteJsonFloats(file, (const float*)(hitbox + hitBoxLayout.minBounds), 3, "%g");
        fputs("],\"max\":[", file);
        WriteJsonFloats(file, (const float*)(hitbox + hitBoxLayout.maxBounds), 3, "%g");
        fputs("]}", file);
    }
    fputs("]}\n", file);
    hitboxes->isDescribed = true;
}

CON_COMMAND(csdm_dump_hitboxes,
            "Appends the world-space hitbox capsules of the alive players to a JSON lines file, usage: "
            "csdm_dump_hitboxes [file]") {
    auto engine = GetEngine();
    auto demo = engine != NULL && engine->IsPlayingDemo() ? engine->GetDemoPlayer() : NULL;
    uint8_t* entitySystem = GetEntitySystem();
    if (demo == NULL || entitySystem == NULL) {
        Log("No demo playing");
        return;
    }

    bool areSchemaFieldsResolved = ResolveSchemaFields();
    int pawnHandleOffset = GetSchemaOffset(FIELD_CONTROLLER_PLAYER_PAWN);
    int sceneNodeOffset = GetSchemaOffset(FIELD_GAME_SCENE_NODE);
    int originOffset = GetSchemaOffset(FIELD_SCENE_NODE_ABS_ORIGIN);

    // Looked up again while missing, the schema may not be ready the first time. m_ModelName is only a fallback for the
    // name the model gives itself, so the command works without it.
    static int modelStateOffset = -1, modelHandleOffset = -1, modelNameOffset = -1, eyeAnglesOffset = -1;
    ResolveFieldOffset(&modelStateOffset, "CSkeletonInstance", "m_modelState");
    ResolveFieldOffset(&modelHandleOffset, "CModelState", "m_hModel");
    ResolveFieldOffset(&modelNameOffset, "CModelState", "m_ModelName");
    ResolveFieldOffset(&eyeAnglesOffset, "CCSPlayerPawn", "m_angEyeAngles");
    if (!areSchemaFieldsResolved || pawnHandleOffset == -1 || sceneNodeOffset == -1 || originOffset == -1 ||
        modelStateOffset == -1 || modelHandleOffset == -1 || eyeAnglesOffset == -1 || !ResolveHitBoxLayouts()) {
        Log("Fields missing");
        return;
    }

    char path[1024];
    if (args.ArgC() > 1) {
        snprintf(path, sizeof(path), "%s", args.Arg(1));
    } else {
        snprintf(path, sizeof(path), "%s", GetPluginLogPath());
        char* separator = strrchr(path, '\\');
        if (separator == NULL) {
            separator = strrchr(path, '/');
        }
        char* fileName = separator != NULL ? separator + 1 : path;
        snprintf(fileName, sizeof(path) - (fileName - path), "csdm_hitboxes.jsonl");
    }

    FILE* file = fopen(path, "a");
    if (file == NULL) {
        Log("Can't open %s", path);
        return;
    }

    // A file needs the description of every model its players reference: the models already described are described
    // again when the dump goes to another file, or to a file deleted since the last call.
    static char describedPath[sizeof(path)] = "";
    fseek(file, 0, SEEK_END);
    if (strcmp(describedPath, path) != 0 || ftell(file) == 0) {
        snprintf(describedPath, sizeof(describedPath), "%s", path);
        for (int i = 0; i < modelHitboxesCount; i++) {
            modelHitboxes[i].isDescribed = false;
        }
    }

    int tick = demo->GetDemoTick();
    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    int writtenCount = 0;
    for (int i = 0; i < controllerCount; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        CEntityIdentity* controllerIdentity = FindPlayerController(controller.entityIndex, controller.steamId);
        if (!controller.isAlive) {
            Log("%s skipped: dead", controller.name);
            continue;
        }
        if (controllerIdentity == NULL) {
            Log("%s skipped: no controller", controller.name);
            continue;
        }

        CEntityHandle handle = ReadPawnHandle(controllerIdentity, pawnHandleOffset);
        CEntityIdentity* pawn = handle.IsValid() ? GetEntityIdentity(entitySystem, handle.GetEntryIndex()) : NULL;
        if (pawn == NULL) {
            Log("%s skipped: no pawn", controller.name);
            continue;
        }

        const uint8_t* instance = (const uint8_t*)pawn->m_pInstance;
        const uint8_t* sceneNode = ReadPointer(instance + sceneNodeOffset);
        if (sceneNode == NULL || !IsReadableMemory(sceneNode + modelStateOffset, 0x100) ||
            !IsReadableMemory(sceneNode + originOffset, 12) || !IsReadableMemory(instance + eyeAnglesOffset, 12)) {
            Log("%s skipped: no scene node", controller.name);
            continue;
        }

        const uint8_t* modelState = sceneNode + modelStateOffset;
        const uint8_t* model = ReadPointer(ReadPointer(modelState + modelHandleOffset));
        // The model names itself, m_ModelName is empty for some agents.
        char modelName[256];
        if (model == NULL || (!ReadString(ReadStringPointer(model + MODEL_NAME_OFFSET), modelName, sizeof(modelName)) &&
                              (modelNameOffset == -1 || !ReadString(ReadStringPointer(modelState + modelNameOffset),
                                                                    modelName, sizeof(modelName))))) {
            Log("%s skipped: no model", controller.name);
            continue;
        }

        ModelHitboxes* hitboxes = GetModelHitboxes(model, modelName);
        // The game keeps the bones of every player up to date, on screen or not: in the dumps the root bone is always
        // at the origin of its player, wherever the camera is.
        const uint8_t* bones = ReadPointer(modelState + MODEL_STATE_BONES_OFFSET);
        if (hitboxes == NULL || bones == NULL || !IsReadableMemory(bones, hitboxes->boneCount * BONE_TRANSFORM_SIZE)) {
            Log("%s skipped: no hitboxes or bones for %s", controller.name, modelName);
            continue;
        }

        if (!hitboxes->isDescribed) {
            DescribeModel(file, hitboxes);
        }

        const float* origin = (const float*)(sceneNode + originOffset);
        const float* angles = (const float*)(instance + eyeAnglesOffset);
        const float* root = (const float*)bones;
        fprintf(file, "{\"type\":\"player\",\"tick\":%d,\"steamId\":\"%llu\",\"model\":", tick,
                (unsigned long long)controller.steamId);
        WriteJsonString(file, hitboxes->name);
        fputs(",\"origin\":[", file);
        WriteJsonFloats(file, origin, 3, "%.3f");
        fputs("],\"angles\":[", file);
        WriteJsonFloats(file, angles, 3, "%.3f");
        fputs("],\"root\":[", file);
        WriteJsonFloats(file, root, 3, "%.3f");
        fputs("],\"capsules\":[", file);
        for (int hitboxIndex = 0; hitboxIndex < hitboxes->hitboxCount; hitboxIndex++) {
            const uint8_t* hitbox = hitboxes->hitboxes + hitboxIndex * hitBoxLayout.size;
            const float* transform = (const float*)(bones + hitboxes->boneIndices[hitboxIndex] * BONE_TRANSFORM_SIZE);
            float ends[6];
            TransformPoint(transform, (const float*)(hitbox + hitBoxLayout.minBounds), ends);
            TransformPoint(transform, (const float*)(hitbox + hitBoxLayout.maxBounds), ends + 3);
            float radius = *(const float*)(hitbox + hitBoxLayout.radius) * transform[3];
            fputs(hitboxIndex > 0 ? ",[" : "[", file);
            WriteJsonFloats(file, ends, 6, "%.2f");
            fputc(',', file);
            WriteJsonFloats(file, &radius, 1, "%g");
            fputc(']', file);
        }
        fputs("]}\n", file);
        writtenCount++;
    }

    fclose(file);
    Log("%d players written to %s", writtenCount, path);
}

#endif
