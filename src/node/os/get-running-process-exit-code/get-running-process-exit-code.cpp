#include <string>
#include <node_api.h>
#include <windows.h>
#include <tlhelp32.h>
#include <tchar.h>
#include <iostream>
#include <thread>

napi_value ThrowNodeError(napi_env env, const char* message, const char* code) {
    napi_value error, errorMsg, errorCode;
    napi_create_string_utf8(env, message, NAPI_AUTO_LENGTH, &errorMsg);
    napi_create_string_utf8(env, code, NAPI_AUTO_LENGTH, &errorCode);
    napi_create_error(env, errorCode, errorMsg, &error);
    napi_throw(env, error);
    
    return nullptr;
}

DWORD GetProcessIdByName(const std::string& processName) {
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) {
        throw std::runtime_error("ERR_SNAPSHOT_FAILED: Failed to create process snapshot.");
    }

    PROCESSENTRY32 pe32;
    pe32.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(hSnapshot, &pe32)) {
        do {
            if (strcmp(pe32.szExeFile, processName.c_str()) == 0) {
                CloseHandle(hSnapshot);
                return pe32.th32ProcessID;
            }
        } while (Process32Next(hSnapshot, &pe32));
    }

    CloseHandle(hSnapshot);

    throw std::runtime_error("ERR_PROCESS_NOT_FOUND: Process not found.");
}

struct Data {
    napi_async_work work;
    napi_deferred deferred;
    std::string processName;
    DWORD exitCode;
    bool errorOccurred;
    std::string errorMessage;
    std::string errorCode;
};

void OnStart(napi_env env, void* data) {
    Data* processData = static_cast<Data*>(data);
    processData->errorOccurred = false;

    try {
        DWORD processID = GetProcessIdByName(processData->processName);
        HANDLE processHandle = OpenProcess(SYNCHRONIZE | PROCESS_QUERY_INFORMATION, FALSE, processID);

        if (!processHandle) {
            throw std::runtime_error("ERR_OPEN_PROCESS: Failed to open process.");
        }

        DWORD waitResult = WaitForSingleObject(processHandle, INFINITE);
        if (waitResult != WAIT_OBJECT_0) {
            CloseHandle(processHandle);
            throw std::runtime_error("ERR_WAIT_PROCESS: Failed to wait for process.");
        }

        if (!GetExitCodeProcess(processHandle, &processData->exitCode)) {
            CloseHandle(processHandle);
            throw std::runtime_error("ERR_GET_EXIT_CODE: Failed to get exit code.");
        }

        CloseHandle(processHandle);
    } catch (const std::exception& e) {
        processData->errorOccurred = true;
        std::string errorStr(e.what());
        size_t pos = errorStr.find(": ");
        if (pos != std::string::npos) {
            processData->errorCode = errorStr.substr(0, pos);
            processData->errorMessage = errorStr.substr(pos + 2);
        } else {
            processData->errorCode = "ERR_UNKNOWN";
            processData->errorMessage = errorStr;
        }
    }
}

void OnEnd(napi_env env, napi_status status, void* data) {
    Data* processData = static_cast<Data*>(data);

    if (processData->errorOccurred) {
        napi_value error, errorMsg, errorCode;
        napi_create_string_utf8(env, processData->errorMessage.c_str(), NAPI_AUTO_LENGTH, &errorMsg);
        napi_create_string_utf8(env, processData->errorCode.c_str(), NAPI_AUTO_LENGTH, &errorCode);
        napi_create_error(env, errorCode, errorMsg, &error);
        napi_reject_deferred(env, processData->deferred, error);
    } else if (status == napi_ok) {
        napi_value result;
        napi_create_int32(env, processData->exitCode, &result);
        napi_resolve_deferred(env, processData->deferred, result);
    } else {
        napi_value error;
        napi_create_string_utf8(env, "ERR_UNKNOWN: Failed to wait for process exit", NAPI_AUTO_LENGTH, &error);
        napi_reject_deferred(env, processData->deferred, error);
    }

    napi_delete_async_work(env, processData->work);
    delete processData;
}

napi_value GetRunningProcessExitCode(napi_env env, napi_callback_info info) {
    size_t expectedArgCount = 1;
    napi_value args[1];
    napi_value thisArg;

    napi_get_cb_info(env, info, &expectedArgCount, args, &thisArg, nullptr);

    if (expectedArgCount != 1) {
        return ThrowNodeError(env, "Process name must be provided.", "ERR_INVALID_ARGUMENT");
    }

    size_t processNameLength;
    napi_get_value_string_utf8(env, args[0], nullptr, 0, &processNameLength);
    std::string processName(processNameLength, '\0');
    napi_get_value_string_utf8(env, args[0], &processName[0], processNameLength + 1, &processNameLength);

    napi_value promise;
    napi_deferred deferred;
    napi_create_promise(env, &deferred, &promise);

    Data* processData = new Data();
    processData->deferred = deferred;
    processData->processName = processName;

    napi_value resourceName;
    napi_create_string_utf8(env, "GetRunningProcessExitCode", NAPI_AUTO_LENGTH, &resourceName);

    napi_create_async_work(env, nullptr, resourceName, OnStart, OnEnd, processData, &processData->work);
    napi_queue_async_work(env, processData->work);

    return promise;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value func;
    napi_create_function(env, nullptr, 0, GetRunningProcessExitCode, nullptr, &func);
    napi_set_named_property(env, exports, "getRunningProcessExitCode", func);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
