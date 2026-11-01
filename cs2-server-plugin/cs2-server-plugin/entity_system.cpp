#include "entity_system.h"

#include "entity2/concreteentitylist.h"
#include "entity2/entityidentity.h"
#include "interfaces/interfaces.h"
#include "library.h"
#include "log.h"
#include "memory.h"
#include "plugin.h"

#ifdef _WIN32
#define ENGINE_LIB_NAME "engine2.dll"
#else
#define ENGINE_LIB_NAME "libengine2.so"
#endif

// The member of the game resource service holding the entity system isn't pinned: every pointer up to this offset is
// tried until one looks like an entity system, see IsEntitySystem.
constexpr int MAX_ENTITY_SYSTEM_OFFSET = 0x400;
// CEntitySystem starts with its vtable pointer and m_pCurrentManifest, then the CConcreteEntityList. Hardcoded because
// including entitysystem.h would drag in most of the SDK.
constexpr int ENTITY_LIST_OFFSET = 0x10;

// Entities are stored in an array of CEntityIdentity, so a wrong struct size puts every entity at the wrong address.
// The game may have added a member the SDK doesn't know about, so two sizes are tried at runtime: the SDK size, and the
// SDK size plus one pointer.
constexpr int IDENTITY_STRIDE_CANDIDATES[] = {
    (int)sizeof(CEntityIdentity),
    (int)(sizeof(CEntityIdentity) + sizeof(void*)),
};
constexpr int MAX_IDENTITY_STRIDE = IDENTITY_STRIDE_CANDIDATES[1];
// Number of entities checked in the first chunk when testing a stride. A stride larger than the real size drifts
// further from the real entries at each step, so only the start of the chunk is checked to stay within its bounds.
constexpr int IDENTITY_STRIDE_PROBE_COUNT = 64;
constexpr int IDENTITY_STRIDE_PROBE_MATCHES = 3;

static bool hasLoggedResourceServiceFailure = false;
static int identityStride = 0;
static void* gameResourceService = NULL;
// Offset of the entity system in the game resource service, -1 until it has been found.
static int entitySystemOffset = -1;

static uint8_t* GetEntityChunk(uint8_t* entitySystem, int index) {
    const CConcreteEntityList* entityList = (const CConcreteEntityList*)(entitySystem + ENTITY_LIST_OFFSET);
    CEntityIdentity* chunk = entityList->m_pIdentityChunks[index / MAX_ENTITIES_IN_LIST];

    return IsPlausiblePointer(chunk) ? (uint8_t*)chunk : NULL;
}

static bool IsIdentityStrideValid(uint8_t* chunk, int stride) {
    int matchCount = 0;
    // Entities of a chunk are stored in index order, so with the right stride the entity at position i of the first
    // chunk has index i.
    for (int i = 0; i < IDENTITY_STRIDE_PROBE_COUNT; i++) {
        const CEntityIdentity* identity = (const CEntityIdentity*)(chunk + stride * i);
        if (!IsPlausiblePointer(identity->m_pInstance)) {
            continue;
        }

        if (identity->GetEntityIndex().Get() != i) {
            return false;
        }

        matchCount++;
    }

    return matchCount >= IDENTITY_STRIDE_PROBE_MATCHES;
}

// A candidate is the entity system when its first entity chunk passes the stride probing.
static bool IsEntitySystem(uint8_t* candidate) {
    if (!IsReadableMemory(candidate, ENTITY_LIST_OFFSET + sizeof(CEntityIdentity*) * MAX_ENTITY_LISTS)) {
        return false;
    }

    // CEntitySystem is polymorphic, so it starts with a vtable pointer.
    if (!IsPlausiblePointer(*(void**)candidate)) {
        return false;
    }

    uint8_t* chunk = GetEntityChunk(candidate, 0);
    // The probing walks the chunk with the largest candidate stride, all of it has to be readable.
    if (chunk == NULL || !IsReadableMemory(chunk, IDENTITY_STRIDE_PROBE_COUNT * MAX_IDENTITY_STRIDE)) {
        return false;
    }

    if (identityStride != 0) {
        return IsIdentityStrideValid(chunk, identityStride);
    }

    for (int candidateStride : IDENTITY_STRIDE_CANDIDATES) {
        if (IsIdentityStrideValid(chunk, candidateStride)) {
            identityStride = candidateStride;
            Log("Entity system: identity size is %#x", candidateStride);
            return true;
        }
    }

    return false;
}

static uint8_t* ReadEntitySystem(int offset) {
    uint8_t* member = (uint8_t*)gameResourceService + offset;

    return IsReadableMemory(member, sizeof(void*)) ? *(uint8_t**)member : NULL;
}

uint8_t* GetEntitySystem() {
    if (gameResourceService == NULL) {
        gameResourceService = FindInterface(ENGINE_LIB_NAME, GAMERESOURCESERVICECLIENT_INTERFACE_VERSION, factory);
        if (gameResourceService == NULL) {
            if (!hasLoggedResourceServiceFailure) {
                hasLoggedResourceServiceFailure = true;
                Log("Entity system: %s not found", GAMERESOURCESERVICECLIENT_INTERFACE_VERSION);
            }
            return NULL;
        }
    }

    // The offset holds for the whole run. The pointer is read again each time rather than cached so that it stays right
    // if the game ever replaces the entity system.
    if (entitySystemOffset != -1) {
        uint8_t* entitySystem = ReadEntitySystem(entitySystemOffset);

        return entitySystem != NULL && IsEntitySystem(entitySystem) ? entitySystem : NULL;
    }

    // The entity system only exists while a demo is playing. Until then no offset matches, nothing is cached, and the
    // scan runs again on the next call.
    for (int offset = 0; offset <= MAX_ENTITY_SYSTEM_OFFSET; offset += sizeof(void*)) {
        uint8_t* candidate = ReadEntitySystem(offset);
        if (candidate == NULL || !IsEntitySystem(candidate)) {
            continue;
        }

        entitySystemOffset = offset;
        Log("Entity system: found at offset %#x of the game resource service", offset);

        return candidate;
    }

    return NULL;
}

CEntityIdentity* GetEntityIdentity(uint8_t* entitySystem, int index) {
    if (index < 0 || index >= MAX_TOTAL_ENTITIES || identityStride == 0) {
        return NULL;
    }

    uint8_t* chunk = GetEntityChunk(entitySystem, index);
    if (chunk == NULL) {
        return NULL;
    }

    CEntityIdentity* identity = (CEntityIdentity*)(chunk + identityStride * (index % MAX_ENTITIES_IN_LIST));

    return IsPlausiblePointer(identity->m_pInstance) ? identity : NULL;
}

void LogEntitySystemState() {
    Log("Entity system offset: %#x, entity identity size: %#x", entitySystemOffset, identityStride);
}
