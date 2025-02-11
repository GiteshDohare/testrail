require('dotenv').config();
const stripAnsi = require('strip-ansi');
const TestRail = require('testrail');

const api = new TestRail({
  host: process.env.TESTRAIL_URL,
  user: process.env.TESTRAIL_USERNAME,
  password: process.env.TESTRAIL_PASSWORD,
});

class Reporter {
  constructor() {}

  async createRun(suiteId, tests) {
    const projectId = process.env.TESTRAIL_PROJECT_ID;
    const currentTime = new Date();

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const message = 'Jest Automated Test Run';
    const suite = await api.getSuite(suiteId);
    const name = `${suite.name} - ${currentTime.toLocaleString(
        ['en-GB'],
        options,
    )} - (${message})`;

    const run = await api.addRun(projectId, {
      name: name,
      suite_id: suiteId,
      case_ids: Array.from(tests.keys()),
      include_all: false,
    });

    try {
      await api.addResultsForCases(run.id, {
        results: Array.from(tests).map((value) => ({
          case_id: value[0],
          status_id: value[1].status_id,
          comment: value[1].comment,
        })),
      });

      await api.closeRun(run.id);
    } catch (error) {
      api.deleteRun(run.id);

      console.log(error.message || error);
    }
  }

  onRunComplete(contexts, results) {
    const specResults = results.testResults;
    const suiteResults = new Map();

    for (let j = 0; j < specResults.length; j += 1) {
      const testResults = specResults[j].testResults;

      for (let i = 0; i < testResults.length; i += 1) {
        const suiteId = this.getId(testResults[i].ancestorTitles[0]);
        if (!suiteId) {
          continue;
        }

        const testId = this.getId(testResults[i].title);

        if (!testId) {
          continue;
        }
        const status = testResults[i].status;

        let testMap = suiteResults.get(suiteId);

        if (!testMap) {
          testMap = new Map();
        }

        switch (status) {
          case 'passed':
            testMap.set(testId, {
              status_id: 1,
              comment: 'Test passed successfully.',
            });

            break;

          case 'failed':
            testMap.set(testId, {
              status_id: 5,
              comment: stripAnsi(testResults[i].failureMessages[0]),
            });

            break;

          case 'pending':
            testMap.set(testId, {
              status_id: 2,
              comment: 'Intentionally skipped.',
            });

            break;
          default:
            continue;
        }

        suiteResults.set(suiteId, testMap);
      }
    }

    for (const [key, value] of suiteResults.entries()) {
      this.createRun(key, value);
    }
  }

  getId(context) {
    if (!context) {
      return;
    }
    const testRailRegExp = RegExp(/TestRail\[\d{1,}\]/g);
    const matches = context.match(testRailRegExp);
    if (!matches || (matches.length && matches.length > 1)) {
      return null;
    }
    return +matches[0].match(/\d{1,}/)[0];
  }
}

module.exports = Reporter;
