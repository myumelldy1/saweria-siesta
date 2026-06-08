const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    // TAMBAHKAN DI SINI
    console.log("=== SAWERIA PAYLOAD ===");
    console.log(JSON.stringify(req.body, null, 2));

    if (req.body.type !== "donation") {
    return res.status(200).json({
        ignored: true
    });
}

    try {

        const donor = req.body.donator_name || "Anonymous";
        const amount = req.body.amount_raw || 0;
        const message = req.body.message || "";

        // Ambil links.json
const linksResponse = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/links.json`,
    {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json"
        }
    }
);

const linksFile = await linksResponse.json();

const links = JSON.parse(
    Buffer.from(
        linksFile.content,
        "base64"
    ).toString("utf8")
);

// Cari kode yang dikirim di pesan donasi
const linkedPlayer = links.find(
    x => x.code === message.trim()
);
        
console.log("MESSAGE:", message);
console.log("LINKED PLAYER:", linkedPlayer);

        
        const fileResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/donations.json`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        const file = await fileResponse.json();

console.log("GitHub Response:", file);

if (!file.content) {
    return res.status(500).json({
        error: "donations.json tidak ditemukan",
        github: file
    });
}

        const donations = JSON.parse(
            Buffer.from(
                file.content,
                "base64"
            ).toString("utf8")
        );

        donations.unshift({
    id: req.body.id,

    donor,
    amount,
    message,

    robloxUserId: linkedPlayer
        ? linkedPlayer.userId
        : null,

    robloxUsername: linkedPlayer
        ? linkedPlayer.username
        : null,

    timestamp: Date.now()
});

        const updatedContent = Buffer.from(
            JSON.stringify(donations, null, 2)
        ).toString("base64");

        await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/donations.json`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({
                    message: `Donation from ${donor}`,
                    content: updatedContent,
                    sha: file.sha
                })
            }
        );

        res.status(200).json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }
}
