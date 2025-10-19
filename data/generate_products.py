import csv
import json
import random
from datetime import datetime, timedelta

random.seed(42)

PRODUCT_NAMES = [
    "Aurora Dashboard Kit",
    "Nimbus Landing Theme",
    "Velocity Ecommerce Stack",
    "Lumen Icon System",
    "Pulse Motion Library",
    "Spectra Design Tokens",
    "Orbit Analytics Pack",
    "Canvas Marketing Blocks",
    "Stratus Blog Theme",
    "Vector Illustration Suite",
    "Beacon Notification Center",
    "Harbor Support KB",
    "Atlas Admin Shell",
    "Drift Chat Widgets",
    "Forge UI Patterns",
    "Beacon Onboarding Flow",
    "Vertex Presentation Deck",
    "Quartz Data Tables",
    "Helix Charts Toolkit",
    "Nimbus Commerce Checkout",
    "Signal Automation Recipes",
    "Nova Email Templates",
    "Tempo Scheduling Suite",
    "Loop Feedback Forms",
    "Summit Pricing Builder",
    "Pilot Roadmap Canvas",
    "Merge Collaboration Kit",
    "Ripple Audio Player",
    "Tonic Video Player",
    "Flux Timeline Pack",
    "Glyph Icon Essentials",
    "Orbit Checkout Modal",
    "Vector Hero Library",
    "Lattice Data Grid",
    "Zen Support Portal",
    "Prism Gradient Bundle",
    "Momentum Launch Page",
    "Stellar SaaS Shell",
    "Canvas Portfolio Stack",
    "Nimbus Feature Flags",
    "Beacon Alert Banners",
    "Constellation Navigation",
    "Echo Voice Commands",
    "Vertex Changelog Feed",
    "Pulse KPI Dashboard",
    "Summit Sales CRM",
    "Helix Reporting Suite",
    "Atlas Billing Module",
    "Drift Webinar Kit",
    "Lumen Accessibility Pack",
]

BADGES = [
    "Bestseller",
    "New",
    "Staff Pick",
    "Limited",
    "Trending",
    "Editor Choice",
]

TAGS = [
    "UI",
    "UX",
    "React",
    "Astro",
    "Design",
    "Motion",
    "Marketing",
    "Analytics",
    "Commerce",
    "Docs",
    "Templates",
    "Automation",
]

INVENTORY_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER"]


def slugify(name: str) -> str:
    return (
        name.lower()
        .replace(" & ", " and ")
        .replace("&", " and ")
        .replace("/", "-")
        .replace(" ", "-")
    )


def main():
    rows = []
    base_date = datetime(2025, 1, 1)

    for idx, name in enumerate(PRODUCT_NAMES, start=1):
        slug = slugify(name)
        summary = f"{name} to accelerate modern product teams."
        description = (
            f"{name} provides reusable components, patterns, and assets tailored for fast-moving SaaS teams."
        )
        price = round(random.uniform(19, 199), 2)
        original_price = (
            round(price * random.uniform(1.05, 1.35), 2) if idx % 3 != 0 else ""
        )
        image_url = f"https://cdn.frontendshop.dev/products/{slug}.jpg"
        thumbnail_url = f"https://cdn.frontendshop.dev/products/{slug}-thumb.jpg"
        badges = random.sample(BADGES, k=random.randint(0, 2))
        tags = random.sample(TAGS, k=random.randint(2, 4))
        rating = round(random.uniform(3.6, 4.9), 2)
        review_count = random.randint(12, 420)
        inventory_status = INVENTORY_STATUSES[idx % len(INVENTORY_STATUSES)]
        featured = "TRUE" if idx % 4 == 0 else "FALSE"
        serial_number = f"FS-{2025 + idx:04d}-{idx:03d}"
        stock = random.randint(0, 250)
        created_at = (base_date + timedelta(days=idx)).isoformat() + "Z"
        updated_at = (base_date + timedelta(days=idx, hours=6)).isoformat() + "Z"

        rows.append(
            {
                "name": name,
                "slug": slug,
                "summary": summary,
                "description": description,
                "price": price,
                "originalPrice": original_price,
                "currency": "USD",
                "imageUrl": image_url,
                "thumbnailUrl": thumbnail_url,
                "badges": json.dumps(badges),
                "tags": json.dumps(tags),
                "rating": rating,
                "reviewCount": review_count,
                "inventoryStatus": inventory_status,
                "featured": featured,
                "serialNumber": serial_number,
                "stock": stock,
                "createdAt": created_at,
                "updatedAt": updated_at,
            }
        )

    fieldnames = [
        "name",
        "slug",
        "summary",
        "description",
        "price",
        "originalPrice",
        "currency",
        "imageUrl",
        "thumbnailUrl",
        "badges",
        "tags",
        "rating",
        "reviewCount",
        "inventoryStatus",
        "featured",
        "serialNumber",
        "stock",
        "createdAt",
        "updatedAt",
    ]

    with open("data/products.csv", "w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
