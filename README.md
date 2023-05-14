# Word Dance

![Screenshot of the result from a game of Word Dance](/worddance.png)

Live at http://worddance.vercel.app/

This is a web game in which the player must write sentences with a word missing, such that a machine learning model fills in the missing word with a target word.

Of course it's a great match for English language learners, but you'd be surprised at how intellectually challenging it can be even for those who are fluent! I find that often the crazier the sentence, the more likely it is to succeed.

### Technologies

-   Programmed in **Javascript** using the **React** and **Next.js** frameworks
-   Currently deployed on [Vercel](https://vercel.com/)

## Do it yourself!

This game is **INCREDIBLY** simple to make!

It could easily be the starter project in a Coding 101 level tutorial, since it's just:

-   A single index.js file that handles all the game logic
-   An [API route](https://nextjs.org/docs/api-routes/introduction) that calls the [Hugging Face Inference API](https://huggingface.co/inference-api) (can't be called in the user-shipped JavaScript only because we don't want to expose our authentication token)
-   And a couple of simple React components

If you're sick of teaching beginners how to create React to-do list apps, I think Word Dance has a lot of opportunity for creativity and extension. There are a lot more interesting machine learning models on the [Hugging Face Hub](https://huggingface.co/models) 😉

### The Machine Learning Model

The machine learning model currently used is [`bert-base-uncased` from the Hugging Face Hub](https://huggingface.co/bert-base-uncased)

#### Authenticating with Hugging Face's API

You will need your own `HUGGINGFACE_API_TOKEN` environment variable in order to authenticate with Hugging Face's API and utilize their machine learning models.

You can add one in a `.env.local` file in the parent directory which [Next.js will automatically load.](https://nextjs.org/docs/basic-features/environment-variables)
