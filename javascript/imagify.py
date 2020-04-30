from pdf2image import convert_from_path

path = input()
doc = convert_from_path(path,500)
doc[0].save('0.jpg', 'JPEG')
