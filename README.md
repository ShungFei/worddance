# Word Dance

Live at http://worddance.vercel.app/

This is a web game in which the player is given a stream of target words and attempts to write sentences with a word missing such that a machine learning model fills in the missing word with one of the target words.

Of course it's a great match for English language learners, but you'd be surprised at how intellectually challenging it can be even for those who are fluent! Oftentimes the crazier the sentence, the more likely it is to succeed.

The machine learning model in current use is [bert-base-uncased from the Hugging Face Accelerated Inference API](https://huggingface.co/bert-base-uncased))

It is created in Javascript using React and Next.js, and is currently deployed on Vercel.

## Deploy your own

You will need your own `HUGGINGFACE_API_TOKEN` environment variable in order for the API route You can add one in a `.env.local` file in the parent directory which [Next.js will automatically load.](https://nextjs.org/docs/basic-features/environment-variables)
