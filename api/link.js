const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const code = req.body.code;
        const userId = req.body.userId;
        const username = req.body.username;

        const response = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/links.json`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        const file = await response.json();

        const links = JSON.parse(
            Buffer.from(
                file.content,
                "base64"
            ).toString("utf8")
        );

        links.unshift({
            code,
            userId,
            username,
            createdAt: Date.now()
        });

        const updatedContent = Buffer.from(
            JSON.stringify(links, null, 2)
        ).toString("base64");

        await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/links.json`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({
                    message: `Link ${username}`,
                    content: updatedContent,
                    sha: file.sha
                })
            }
        );

        res.status(200).json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
}
