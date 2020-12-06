#!/bin/bash

echo what should the version be?

docker build -t ncng10/tech:$VERSION .
docker push ncng10/tech:$VERSION



