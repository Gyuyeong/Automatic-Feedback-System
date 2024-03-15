from PIL import Image
import glob

frames = []
imgs = glob.glob("*.jpg")

for i in imgs:
    new_frame = Image.open(i)
    new_frame = new_frame.convert('RGB').convert('P', palette=Image.ADAPTIVE)
    frames.append(new_frame)

frames[0].save('iceland.gif', save_all=True, append_images=frames[1:], loop=0)