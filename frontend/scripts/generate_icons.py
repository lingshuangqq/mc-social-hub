from PIL import Image
import os

def create_icons():
    # Load source logo
    try:
        logo = Image.open("logo.png").convert("RGBA")
    except FileNotFoundError:
        print("Error: logo.png not found in root")
        return

    # Define sizes
    sizes = {
        "favicon.png": (64, 64),
        "apple-touch-icon.png": (180, 180),
        "pwa-192x192.png": (192, 192),
        "pwa-512x512.png": (512, 512)
    }

    target_dir = "public"
    os.makedirs(target_dir, exist_ok=True)

    for name, size in sizes.items():
        # Create white background
        bg = Image.new("RGBA", size, "white")
        
        # Resize logo to fit (keep aspect ratio, add padding)
        logo_aspect = logo.width / logo.height
        target_aspect = size[0] / size[1]
        
        # Calculate resize dimensions with 10% padding
        padding = 0.15
        available_w = size[0] * (1 - padding * 2)
        available_h = size[1] * (1 - padding * 2)
        
        if logo_aspect > target_aspect:
            new_w = available_w
            new_h = new_w / logo_aspect
        else:
            new_h = available_h
            new_w = new_h * logo_aspect
            
        resized_logo = logo.resize((int(new_w), int(new_h)), Image.Resampling.LANCZOS)
        
        # Center paste
        paste_x = (size[0] - resized_logo.width) // 2
        paste_y = (size[1] - resized_logo.height) // 2
        
        bg.paste(resized_logo, (paste_x, paste_y), resized_logo)
        
        # Save as flattened PNG (remove alpha for iOS compat)
        final_img = bg.convert("RGB")
        final_img.save(os.path.join(target_dir, name))
        print(f"Generated {name}")

if __name__ == "__main__":
    create_icons()
