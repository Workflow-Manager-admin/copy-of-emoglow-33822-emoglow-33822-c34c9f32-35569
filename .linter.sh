#!/bin/bash
cd /home/kavia/workspace/code-generation/emoglow-33822-c34c9f32/emoglow_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

