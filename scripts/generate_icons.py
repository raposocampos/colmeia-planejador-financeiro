from pathlib import Path
from PIL import Image, ImageDraw


def hexagon(cx: float, cy: float, radius: float) -> list[tuple[float, float]]:
    return [
        (cx, cy - radius),
        (cx + radius * 0.866, cy - radius * 0.5),
        (cx + radius * 0.866, cy + radius * 0.5),
        (cx, cy + radius),
        (cx - radius * 0.866, cy + radius * 0.5),
        (cx - radius * 0.866, cy - radius * 0.5),
    ]


def render_icon(size: int, destination: Path) -> None:
    scale = 4
    canvas = Image.new("RGB", (size * scale, size * scale), "#F8BF4D")
    draw = ImageDraw.Draw(canvas)
    radius = size * scale * 0.15
    center_x = size * scale * 0.5
    center_y = size * scale * 0.49
    gap_x = radius * 0.9
    gap_y = radius * 1.55
    cells = [
        (center_x, center_y - gap_y, "#FFC639"),
        (center_x - gap_x, center_y - gap_y * 0.5, "#FBC108"),
        (center_x + gap_x, center_y - gap_y * 0.5, "#FBB321"),
        (center_x - gap_x, center_y + gap_y * 0.5, "#FFE161"),
        (center_x + gap_x, center_y + gap_y * 0.5, "#FFC639"),
        (center_x, center_y, "#231F20"),
    ]
    for x, y, color in cells:
        draw.polygon(hexagon(x, y, radius * 0.92), fill=color)
    icon = canvas.resize((size, size), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    icon.save(destination, "PNG", optimize=True)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1] / "public"
    render_icon(192, root / "icon-192.png")
    render_icon(512, root / "icon-512.png")
