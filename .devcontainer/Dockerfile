# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 18, 16, 14, 18-bullseye, 16-bullseye, 14-bullseye, 18-buster, 16-buster, 14-buster
ARG VARIANT=20-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:1-${VARIANT}


RUN mkdir -p /workspace/.pnpm && chown -R node:node /workspace/.pnpm
ENV PNPM_HOME=/workspace/.pnpm
ENV PATH $PNPM_HOME:$PATH

# Install nx globally using pnpm
RUN pnpm add --global nx@latest
