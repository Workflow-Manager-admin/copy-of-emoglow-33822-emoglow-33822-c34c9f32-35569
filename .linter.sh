#!/bin/bash
cd /home/kavia/workspace/code-generation/copy-of-emoglow-33822-emoglow-33822-c34c9f32-35569/emoglow_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

