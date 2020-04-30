import ast

f = open("query.txt", "r")
asset = f.read()
asset = ast.literal_eval(asset)
f.close()
if(type(asset) is dict):
    print(asset.get('accepted'))

else:
    if(len(asset)>0):
        for a in asset:
            print(a.get('appInfo').get('accepted'))
