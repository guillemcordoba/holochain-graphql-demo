/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example

const path = require('path')
const {  Orchestrator, Config, combine, localOnly, tapeExecutor } = require('@holochain/tryorama')

const dnaPath = path.join(__dirname, "../dist/dna.dna.json")
const orchestrator = new Orchestrator({
  middleware: combine(
    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require('tape')),

    // specify that all "players" in the test are on the local machine, rather than
    // on remote machines
    localOnly,
  )
})

const dna = Config.dna(dnaPath, 'course_dna')
const conductorConfig = Config.gen(
  {
    course_dna: dna
  },
  {
    network: {
      type: 'sim2h',
      sim2h_url: 'ws://localhost:9000',
    },
  })

orchestrator.registerScenario("create_post and get_all_posts", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const create_post_1 = await alice.call("course_dna", "courses", "create_post", {"content" : "test"})
  const create_post_2 = await alice.call("course_dna", "courses", "create_post", {"content" : "test2"})
  const create_post_3 = await bob.call("course_dna", "courses", "create_post", {"content" : "test3"})

  // Wait for all network activity to settle
  await s.consistency()

  const get_all_posts_results = await alice.call("course_dna", "courses", "get_all_posts", {})

  // check for equality of the actual and expected results
  t.deepEqual(get_all_posts_results.Ok.length, 3)
})

orchestrator.run()
