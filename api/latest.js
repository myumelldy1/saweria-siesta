const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

export default async function handler(req, res) {

    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/donations.json`,
        {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`
            }
        }
    );

    const file = await response.json();

    const donations = JSON.parse(
        Buffer.from(file.content, "base64")
        .toString("utf8")
    );

    res.status(200).json(
        donations[0] || {}
    );
}
