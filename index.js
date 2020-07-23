const TestRail = require('testrail');

const dotenv = require('dotenv');
const fs = require('fs');
const stripAnsi = require('strip-ansi');

let envFile = null;

try {
  envFile = fs.readFileSync('.env');
} catch (error) {
  console.error("You don't have an .env file!\n", error);
  process.exit(1);
}

const config = dotenv.parse(envFile);

const api = new TestRail({
  host: config.TESTRAIL_URL,
  user: config.TESTRAIL_USERNAME,
  password: config.TESTRAIL_PASSWORD,
});

class Reporter {
  
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async createRun(suiteId, tests) {
    const projectId = this._options.project_id;

    const now = new Date();

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    let message = 'Jest automated test run'

    if (config.TESTRAIL_MESSAGE) {
      message = config.TESTRAIL_MESSAGE
    }

    const suite = await api.getSuite(suiteId);
      
    const name = `${suite.name} - ${now.toLocaleString(['en-GB'], options)} - (${message})`;

    const run = await api.addRun(projectId, {
      suite_id: suiteId,
      name: name,
      include_all: false,
      case_ids: Array.from(tests.keys()),
    });

    try {
      await api.addResultsForCases(run.id, {
        results: Array.from(tests).map((value)=>({
          case_id: value[0],
          status_id: value[1].status_id,
          comment: value[1].comment,
        })),
      });

      await api.closeRun(run.id);
    } catch(error) {
      api.deleteRun(run.id);

      console.log(error.message || error);
    }
  }

  onRunComplete(contexts, results) {
    const specResults = results.testResults;
    
    const suiteResults = new Map();

    for (let j = 0; j < specResults.length; j += 1) {
      
      const itResults = specResults[j].testResults;

      for (let i = 0; i < itResults.length; i += 1) {
        const suiteId = this.getId(itResults[i].ancestorTitles[0]);
        if (!suiteId) {
          continue;
        }
        const testId = this.getId(itResults[i].title);
        if (!testId) {
          continue;
        }
        const status = itResults[i].status;

        let testMap= suiteResults.get(suiteId);

        if (!testMap) {
          testMap = new Map();
        }

        switch (status) {
          case 'pending':
            testMap.set(testId, {
              status_id: 2,
              comment: 'Intentionally skipped.',
            });
            break;
          case 'failed':
            testMap.set(testId, {
              status_id: 5,
              comment: stripAnsi(itResults[i].failureMessages[0]),
            });
            break;
          case 'passed':
            testMap.set(testId, {
              status_id: 1,
              comment: 'Test passed successfully.',
            });
            break;
          default:
            continue;
        }

        suiteResults.set(suiteId, testMap);
      }
    }

    for (let [key, value] of suiteResults.entries()) {
      this.createRun(key, value);
    }
  }

  getId(context) {
    const testRailRegExp = RegExp(/TestRail\(\d{1,}\)/g);
    const matches = context.match(testRailRegExp);
    if (!matches || matches.length && matches.length > 1) {
      return null;
    }
    return + matches[0].match(/\d{1,}/)[0];
  }
}

module.exports = Reporter;