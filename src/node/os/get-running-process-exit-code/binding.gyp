{
  "targets": [
    {
      "target_name": "get_running_process_exit_code",
      "conditions": [
        ['OS=="win"', {
          "sources": ["get-running-process-exit-code.cpp"]
        }]
      ]
    }
  ]
}
