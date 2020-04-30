import cv2
import imutils
import math
import numpy as  np
from PIL import Image, ImageDraw, ImageFont
import ast

SCALE = 4
def font_size(text, w, h):
    i=0.1
    (t_w, t_h), baseline = cv2.getTextSize(text, 2, i , 2)
    while(t_w*t_h<w*h and t_w<w):
        i+=0.01
        (t_w, t_h), baseline = cv2.getTextSize(text, 2, i , 2)
    return(i-0.01)


def show_scaled(name, img):
    try:
        h, w  = img.shape
    except ValueError:
        h, w, _  = img.shape
    cv2.imshow(name, cv2.resize(img, (w // SCALE, h // SCALE)))

def recreate(asset):
    img = 255 * np.ones((2924,2066,3), np.uint8)
    font = 2
    color = (0,0,0)
    thickness = 2
    for l1 in asset:
        text = l1[0]
        org = l1[1][0:2]
        area = l1[1][2:4]
        if not area:
            continue
        font_scale = font_size(text, area[0], area[1]) #w,h
        org = tuple(org)
        img = cv2.putText(img, text, org, font, font_scale, color, thickness, cv2.LINE_AA)
    return img

f = open("query.txt", "r")
asset = f.read()
asset = ast.literal_eval(asset)
f.close()
if(type(asset) is dict):
    general = ast.literal_eval(asset.get('generalInfo'))
    if(asset.get('accepted')==1):
        temp = ast.literal_eval(asset.get('sensitiveInfo'))
        for t in temp:
            if not t[1]:
                continue
            for i in range(len(t[0])):
                l = []
                l.append(t[0][i])
                l.append(t[1][i])
                general.append(l)
    img = recreate(general)
    cv2.imwrite("r1.jpg", img)
    # print(asset.get('attributes')[1])

else:
    if(len(asset)>0):
        i=1
        for a in asset:
            general = ast.literal_eval(a.get('appInfo').get('generalInfo'))
            if(a.get('appInfo').get('accepted')==1):
                temp = ast.literal_eval(a.get('appInfo').get('sensitiveInfo'))
                for t in temp:
                    if not t[1]:
                        continue
                    for k in range(len(t[0])):
                        l = []
                        l.append(t[0][k])
                        l.append(t[1][k])
                        general.append(l)
            img = recreate(general)
            cv2.imwrite("r"+str(i)+".jpg", img)
            print(a.get('Key').get('attributes')[1])
            i+=1
