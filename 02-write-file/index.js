const { stdout } = process;
const path = require('path');
const fs = require('fs');
const readline = require('readline');

stdout.write('Hello! Type something:)\n');

function wrilteLine() {
    return new Promise(function(resolve, reject) {
      let rl = readline.createInterface(process.stdin, process.stdout)
      rl.prompt();
      rl.on('line', function(line) {
        if (line.trim() === "exit") {
          rl.close();
          return;
        } else {
            fs.appendFile(path.join(__dirname, 'testFile.txt'), `${line}\n`, 'utf8', (err) => {
                if(err) reject(err);
            });
        }
        rl.prompt();
  
      }).on('close',function(){
        resolve('Bye!');
      });
    })
}

async function run() {
    try {
      let replayResult = await wrilteLine();
      console.log(replayResult);
    } catch(e) {
      console.log('Error:', e);
    }
}
  
run();
