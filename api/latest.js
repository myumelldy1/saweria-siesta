const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

export default async function handler(req, res) {
    try {

        const response = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/donations.json`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        const file = await response.json();

        if (!file.content) {
            return res.status(500).json({
                step: "github",
                githubResponse: file
            });
        }

        const donations = JSON.parse(
            Buffer.from(file.content, "base64").toString("utf8")
        );

        const latest = donations[0];

        if (!latest) {
            return res.status(200).json({
                error: "No donations found"
            });
        }

        return res.status(200).json({
            donator: latest.donor,
            amount: latest.amount,
            message: latest.message,
            timestamp: latest.timestamp
        });

    } catch (err) {

        return res.status(500).json({
            error: err.message,
            stack: err.stack
        });

    }
}
