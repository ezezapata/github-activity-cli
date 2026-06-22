type GithubEvent = {
    type: string,
    repo: {name: string},
    created_at: string,
    payload: any
}

type Payload = {
    ref?: string,
    ref_type?: string,
    action?: string,
    number?: number
}

const alowedEventTypes = ["PushEvent", "CreateEvent", "PullRequestEvent"];

function argumentParser(args: string[]) {
    const result: any = {
        username: null,
        filterEventType: null,
        limit: null
    }

    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        if(!arg.startsWith("--")){
            if(!result.username) {
                result.username = arg;
            }
            continue;
        }

        const key = arg.replace("--", "");
        const value = args[i + 1];

        if(key === "type" && alowedEventTypes.includes(value)) {
            result.filterEventType = value;
        }

        if(key === "limit" && !isNaN(parseInt(value))) {
            result.limit = parseInt(value);
        }

        i++; // Skip the value in the next iteration
    } 
    
    return result;
}

async function getGithubActivity(username: string) {
    const url = `https://api.github.com/users/${username}/events`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

function formatPushEvent(payload: Payload, repoName: string, createdAt: string): string {
    const branch = payload.ref?.replace("refs/heads/", "") ?? "unknown";
    return `Pushed to branch ${branch} in ${repoName} at ${createdAt}`;
}

function formatPR(payload: Payload, repoName: string, createdAt: string): string {
    return `${payload.action} PR #${payload.number} in ${repoName} at ${createdAt}`;
}

function formatCreate(payload: Payload, repoName: string, createdAt: string): string {
    return `Created ${payload.ref_type} ${payload.ref} in ${repoName} at ${createdAt}`;
}

function formatEvent(event: GithubEvent): string | null {
    const eventType: string = event.type;
    const repoName = event.repo.name;
    const createdAt = new Date(event.created_at).toLocaleString();

    switch (eventType) {
        case "PushEvent":
            return formatPushEvent(event.payload, repoName, createdAt);
        case "CreateEvent":
            return formatCreate(event.payload, repoName, createdAt);
        case "PullRequestEvent":
            return formatPR(event.payload, repoName, createdAt);
        default:
            console.warn(`[!] - Unhandled event type: ${eventType}`);
            return null;
    }
}

async function main() {
    const {username, filterEventType, limit} = argumentParser(process.argv.slice(2));

    if(!username) {
        console.error("Please provide a username as an argument");
        console.log("Usage: npm run dev <username>");
        process.exit(1);
    }

    if(filterEventType === null && process.argv.includes("--type")) {
        console.error(`Invalid event type. Allowed types are: ${alowedEventTypes.join(", ")}`);
        process.exit(1);
    }

    console.log("Github Activity CLI");
    console.log(`Username: ${username}`);

    try {
        const data = await getGithubActivity(username);

        const filteredData = filterEventType 
            ? data.filter((event: any) => event.type === filterEventType)
            : data;

        const limitedData = limit
            ? filteredData.slice(0, limit)
            : filteredData;

        console.log("Recent Activity:");
        console.log("-----------------");

        limitedData.forEach((event: GithubEvent) => {
            const formattedEvent = formatEvent(event);
            if (formattedEvent) {
                console.log(`[+] ${formattedEvent}`);
            }
        })
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}


main();