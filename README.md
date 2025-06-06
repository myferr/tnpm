<p align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&pause=300&color=3CF772&center=true&vCenter=true&repeat=false&width=435&lines=tnpm"/>

</p>

tnpm is a lightweight node package manager, built with JavaScript.

## Features

- **Instant install** – minimal dependency resolution
- **Global installs** – install packages globally using `tnpm i -g <package>`
- **Simple CLI** – easy to use, clean output
- **npm-powered publishing**

## Installation

```bash
npm install -g tnpm          # Install
tnpm                         # After install
```

## Stats

| Package Manager | Install speed | Uninstall speed |
| --- | --- | --- |
| npm | 1.88 seconds | 2.39 seconds |
| tnpm | 1.88 seconds | 1.85 seconds |

## Usage

```bash
tnpm install        # install all dependencies
tnpm install react  # install specific package
tnpm uninstall axios
tnpm create my-app
tnpm publish        # publish using npm
```

---

## Commands

| Command | Alias | Description |
| --- | --- | --- |
| `tnpm install` | `i` , `add`,`get` | Install packages |
| `tnpm uninstall` | `remove`, `rm` | Remove packages |
| `tnpm create` | `init`, `c` | Execute a `create-` package |
| `tnpm publish` | `pub` | Publish package to registry |
| `tnpm unpublish` | `unpub` | Unpublish a package |
| `tnpx` or `tnpm execute` | `exec` (tnpm exec) | Execute a package script (e.g. create-next-app) |
