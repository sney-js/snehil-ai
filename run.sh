df -k .

eval `ssh-agent -s`
ssh-add ~/.ssh/id_rsa_github
alias dc=docker-compose

cd ai-companion || exit
echo "Getting Git"
git stash; git pull;

echo "Docker down"
docker-compose ls;
docker-compose down;
docker-compose up --build -d;

echo "docker-compose logs -f"
docker-compose logs -f;
#killall node;
#killall chrome;
#cd ..;
