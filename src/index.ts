async function getGithubActivity(username: string) {
    const url = `https://api.github.com/users/${username}/events`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

async function main() {
    const username = process.argv[2];

    if(!username) {
        console.error("Please provide a username as an argument");
        console.log("Usage: npm run dev <username>");
        process.exit(1);
    }

    console.log("Github Activity CLI");
    console.log(`Username: ${username}`);

    try {
        const data = await getGithubActivity(username);
        console.log("Recent Activity:");
        console.log(data);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}


main();