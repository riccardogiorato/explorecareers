I just added upstash envs
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

So we can do these:

- [ ]Add loading state to inform people that it may take up to 15-20 seconds to generate
- [ ] Add rate limiting with Redis Upstash ratelimit max 10 resumes a day
- [ ] Add sharability to the URLs with nanoid and upstash to store resumes
- [ ] Rework how we do AI elaboration using the generateText with "structured-data.md" to see if we can compress down the multiple AI calls with a simpler approach where we generate all options in a single AI call? Before doing this fully implement a benchmark between running current approach 1 ai call with then multiple ai calls versus a single ai call doing all the work with nested data within.