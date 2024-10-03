{
  "targets": [
    {
      "target_name": "get_running_process_exit_code",
      "conditions": [
        ['OS=="win"', {
          "sources": ["src/node/os/get-running-process-exit-code/get-running-process-exit-code.cpp"]
        }]
      ]
    }
  ]
}
