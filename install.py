import json, shutil

dir_path = "/usr/lib/scratch2/scratch_extensions/"
file_path = dir_path + "extensions.json"

shutil.copyfile("./pwm_ext.js", dir_path + "pwm_ext.js")

with open(file_path) as file:
    exts = json.loads(file.read())

new_row = { "name":"Pi PWM", "type":"extension", "file":"pwm_ext.js", "md5":"", "url":"", "tags":["hardware"] }
exts.append(new_row)

with open(file_path, "w") as file:
    file.write(json.dumps(exts, sort_keys=True, indent=4, separators=(',', ': ')))