# GET VERSION:

sudo apt-get update
sudo apt-get install curl

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

echo "BUILDING FOR VERSION $PACKAGE_VERSION"

# pull latest version
ISTHERE=$(curl -s --head -w %{http_code} https://hub.docker.com/v2/repositories/connectedacademy/gossipmill/tags/$PACKAGE_VERSION/ -o /dev/null)

if [ $ISTHERE -ne '200' ]
then
    VERSION=PACKAGE_VERSION
    echo "VERSION DOES NOT EXIST, TAGGING"
else
    echo "INCREMENT VERSION USING npm version BEFORE RE-RUNNING"
    exit 1
fi