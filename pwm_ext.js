new (function() {
    var ext = this;
    var fs = require('fs')
    const {dialog} = require('electron').remote
    const {BrowserWindow} = require('electron').remote
    var { execSync } = require('child_process');
    const pycode = `
	import RPi.GPIO as GPIO
	import time, argparse
	
	parser = argparse.ArgumentParser()
	parser.add_argument("pin", help="BCM pin number", type=int)
	parser.add_argument("frequency", help="PWM frequency", type=int)
	parser.add_argument("duty", help="PWM duty cycle", type=float)
	parser.add_argument("time", help="Time before off", type=float)
	args = parser.parse_args()

	GPIO.setwarnings(False)

	GPIO.setmode(GPIO.BCM)
	GPIO.setup(args.pin, GPIO.OUT)

	p = GPIO.PWM(args.pin, args.frequency)
	p.start(args.duty)
	time.sleep(args.time)
	p.stop()`

    // Cleanup function when the extension is unloaded
    ext._shutdown = function ()
    {
        var cpu = fs.readFileSync ("/proc/cpuinfo", 'utf8');
        if (cpu.indexOf ("ARM") != -1)
        {
            for (pin = 2; pin < 28; pin++)
            {
                if (fs.existsSync("/sys/class/gpio/gpio" + pin))
                    fs.writeFileSync("/sys/class/gpio/unexport", pin, "utf8");
            }
        }
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function ()
    {
        return {status: 2, msg: 'Ready'};
    };

    ext.set_gpio = function (pin, freq, duty, time) 
    {
        if (pin === '' || pin < 0 || pin > 27) return;
        if (freq === '' || freq <= 0) return;
        if (duty === '' || duty < 0 || duty > 100) return;
        if (time === '' || time <= 0) return;

        execSync(`/usr/bin/python /tmp/gpiopwm.py ${pin} ${freq} ${duty} ${time}`);

    };
    
    // Block and block menu descriptions
    var cpu = fs.readFileSync ("/proc/cpuinfo", 'utf8');
    if (cpu.indexOf ("ARM") != -1)
    {
        var descriptor = {
            blocks: [
                [' ', 'set pwm pin %m.gpios to %n Hz with duty of %n for %n s', 'set_gpio', '', 50, 50, 0.2],
            ],
            menus: {
                gpios: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'],
            }
        };
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    if (!fs.existsSync("/tmp/gpiopwm.py"))
        fs.writeFileSync("/tmp/gpiopwm.py", pycode.replaceAll("\t", ""), "utf8");

    // Register the extension
    ScratchExtensions.register('Pi PWM', descriptor, ext);
})();
