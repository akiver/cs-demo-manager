# CS2 server plugin

A library loaded into CS2 when the app starts the game. It connects to the CS:DM WebSocket server and listens for
messages that result in game actions, drives the demo playback from the files the app writes next to the demo, and
draws the in-game panels.

The developer documentation (rules, building, testing, debugging, how the plugin works) is in [AGENTS.md](AGENTS.md).
It is written for coding agents first and reads as a regular guide for humans.
