# Installation

Choose the binary for a single process, Docker for a container with a persistent volume, or the source quick start to build the project.

## Linux x64

~~~bash
curl -LO https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-linux-amd64.tar.gz
tar -xzf anubis-linux-amd64.tar.gz
mv anubis-linux-amd64 anubis
./anubis init
./anubis serve
~~~

The archive contains `anubis-linux-amd64`. ARM, ARM64 and FreeBSD builds are available from the [release page](https://github.com/AnubisWatch/AnubisWatch/releases/latest).

## macOS Apple Silicon

~~~bash
curl -LO https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-darwin-arm64.tar.gz
tar -xzf anubis-darwin-arm64.tar.gz
mv anubis-darwin-arm64 anubis
./anubis init
./anubis serve
~~~

For an Intel Mac, use the Darwin AMD64 archive and rename that extracted binary.

## Windows x64

Run in PowerShell:

~~~powershell
Invoke-WebRequest -Uri "https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-windows-amd64.zip" -OutFile anubis.zip
Expand-Archive anubis.zip -DestinationPath . -Force
Move-Item .\anubis-windows-amd64.exe .\anubis.exe -Force
.\anubis.exe init
.\anubis.exe serve
~~~

## Docker

Set your own administrator password and retain the data volume:

~~~bash
docker run -d --name anubiswatch \
  -p 8080:8080 \
  -e ANUBIS_ADMIN_PASSWORD="replace-with-a-strong-password" \
  -v anubis-data:/data \
  ghcr.io/anubiswatch/anubiswatch:latest
~~~

Open `http://localhost:8080`. Runtime data is stored under `/data`. Use a release tag instead of `latest` to pin the image.

## Build from source

~~~bash
git clone https://github.com/AnubisWatch/anubiswatch.git
cd anubiswatch
./run.sh
~~~

The script builds the binary if necessary, creates a configuration, generates an administrator password and prints the dashboard URL. Source builds require Go matching `go.mod` and Node.js for the dashboard.

## Your first login

`init` prints the initial credentials and dashboard URL. Keep the generated password and use the actual selected port. Configuration is written to `anubis.json` by default.

Check the release's `checksums.txt` against your archive before running it. Commands written as `anubis` in the reference assume the binary is on your PATH; otherwise use `./anubis` or `.\anubis.exe` from its directory.

Continue with [Your first monitor](/docs/first-monitor/) or review [deployment patterns](/docs/deployment/).
