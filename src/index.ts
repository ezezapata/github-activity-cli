console.log("Github Activity CLI");
const username = process.argv[2];

if(!username) {
    console.error("Please provide a username as an argument");
    console.log("Usage: npm run dev -- <username>");
    process.exit(1);
}
console.log(`Username: ${username}`);
