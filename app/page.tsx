'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RecentImages from './components/RecentImages';
import UserRecentDesigns from './components/UserRecentDesigns';

// List of wacky ideas
const wackyIdeas = [
  "A disco ball pineapple riding a unicycle made of breadsticks.",
  "Three squirrels in tiny business suits having a high-stakes acorn negotiation.",
  "A sentient cloud that rains glitter and complains about the weather.",
  "A cactus wearing sunglasses and playing an electric guitar.",
  "A flock of rubber ducks migrating south in V-formation.",
  "A steampunk teacup powered by lightning bugs.",
  "A chameleon trying to blend in with a Jackson Pollock painting.",
  "A sloth astronaut slowly planting a flag on a giant donut.",
  "An octopus librarian organizing books with all eight arms.",
  "A T-Rex struggling to use a smartphone with its tiny arms.",
  "A pizza slice surfing on a wave of melted cheese.",
  "A garden gnome leading a yoga class for confused earthworms.",
  "A toaster that launches toast into orbit.",
  "A fluffy kitten piloting a giant mech warrior suit.",
  "A talking banana peel giving existential advice.",
  "A group of penguins wearing sombreros and playing maracas.",
  "A giraffe trying to drink coffee from a tiny espresso cup.",
  "A marshmallow knight battling a dragon made of smoke.",
  "A sentient sock puppet performing Shakespeare.",
  "A robot chef that only cooks spaghetti with gummy worms.",
  "A narwhal using its tusk as a pool cue.",
  "A vending machine that dispenses philosophical questions instead of snacks.",
  "A fuzzy caterpillar wearing high heels.",
  "A hamster running on a wheel that powers a tiny disco.",
  "A singing potato accompanied by a choir of carrots.",
  "A wizard who accidentally turned his beard into snakes.",
  "A platypus detective investigating a missing rubber duck.",
  "A butterfly with stained-glass wings.",
  "A grumpy badger trying to file taxes.",
  "A sentient armchair that tells boring stories.",
  "A penguin riding a rocket-powered sled.",
  "A koala knitting a sweater made of rainbows.",
  "A sentient mailbox complaining about junk mail.",
  "A squirrel challenging a chess grandmaster.",
  "A group of flamingos doing synchronized swimming in a pool of lemonade.",
  "A robot trying to understand the concept of sarcasm.",
  "A whale wearing a tiny top hat.",
  "A sentient mop cleaning up its own existential dread.",
  "A pack of wolves howling at a disco ball moon.",
  "A garden slug writing a symphony.",
  "An alien tourist asking for directions to the best tacos.",
  "A jellyfish wearing a monocle and judging a beauty contest.",
  "A sentient traffic cone directing birds.",
  "A bear trying to assemble IKEA furniture.",
  "A cloud shaped like a rubber chicken.",
  "A group of ants building a tiny replica of the Eiffel Tower.",
  "A philosophical goldfish contemplating the nature of its bowl.",
  "A raccoon attempting to hotwire a tricycle.",
  "A snowman melting dramatically while reciting poetry.",
  "A sentient pair of scissors giving haircuts to confused sheep.",
  "A vulture reviewing restaurants.",
  "A time-traveling pigeon trying to prevent a historical event.",
  "A haunted Roomba vacuum cleaner.",
  "A shy Loch Ness Monster trying to ask for a cup of sugar.",
  "A group of mushrooms having a tiny rave.",
  "A baboon playing the bagpipes.",
  "A sentient waffle iron making existential pancakes.",
  "A caterpillar driving a miniature convertible.",
  "A sloth winning a marathon... eventually.",
  "A dolphin composing a rock opera.",
  "A sentient piece of cheese running for president.",
  "A ninja librarian shushing patrons too loudly.",
  "A polar bear sunbathing on a tropical beach.",
  "A group of hedgehogs forming a punk rock band.",
  "A sentient houseplant demanding more sunlight and plotting world domination.",
  "A duck wearing cement shoes at the bottom of a pond.",
  "A wizard whose spells always have unexpected, silly side effects.",
  "A cyborg squirrel gathering nuts for the winter... and spare parts.",
  "A mountain goat yodeling opera.",
  "A sentient gumdrop exploring a vast gingerbread city.",
  "A chameleon who is permanently stuck in plaid.",
  "A crab conducting an orchestra of seashells.",
  "A robot dog trying to bury a digital bone.",
  "A group of owls hosting a silent disco.",
  "A sentient teapot pouring philosophical tea.",
  "A mouse riding a cat like a noble steed.",
  "A Bigfoot trying to order shoes online.",
  "A sentient slice of cake hiding from hungry party guests.",
  "A giraffe tangled in Christmas lights in July.",
  "A swarm of bees spelling out existential questions."
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Storing prompt in localStorage:', prompt);
      // Store the prompt in localStorage to use it on the design page
      localStorage.setItem('userPrompt', prompt);
      
      // Clear any previously generated image from localStorage
      localStorage.removeItem('generatedImageUrl');
      
      // Add a small delay before navigating to ensure localStorage updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the design page
      router.push('/design');
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setIsLoading(false);
    }
  };

  // Function to handle the CHAOTIC button click
  const handleChaoticClick = () => {
    const randomIndex = Math.floor(Math.random() * wackyIdeas.length);
    setPrompt(wackyIdeas[randomIndex]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 z-10">
        <section className="w-full md:w-2/3 backdrop-blur-sm bg-gradient-to-br from-purple-100 via-pink-100 to-white/30 p-8 rounded-2xl shadow-2xl border border-white/60">
          <div className="text-center mb-8 relative">
            <div className="flex justify-center items-center mb-4">
              <Image 
                src="/a894840a-2690-4f1f-9cfd-5b0c1c3e6285.png" 
                alt="ChaosStickers Logo" 
                width={350} 
                height={200}
                className="mb-2" 
              />
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Let your imagination run wild & embrace the <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600">chaos</span>!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                className="w-full p-4 bg-white/70 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px] resize-none shadow-md transition-all duration-300 group-hover:shadow-lg"
                placeholder="Describe your wildest art ideas... (e.g., 'A magical fox with rainbow fur dancing under cosmic auroras')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Magic...
                  </>
                ) : (
                  'Unleash My Creativity! ✨'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-800 font-medium">
              Enter any idea, and our AI will transform it into a <span className="text-purple-800 font-bold">vibrant</span> sticker design!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">Magical</span>
              <span className="inline-block px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm font-medium">Colorful</span>
              <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">Creative</span>
              <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">Unique</span>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleChaoticClick}
                className="px-4 py-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300 ease-in-out animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                🎲 Feeling CHAOTIC?
              </button>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-gray-800 font-semibold">
                ✨ Design today, get <span className="text-purple-700 font-bold">real physical stickers</span> delivered to your door! ✨
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Premium vinyl stickers shipped within the US in 5-7 business days
              </p>
            </div>
          </div>
        </section>
        
        <aside className="w-full md:w-1/3 flex flex-col gap-6">
          <UserRecentDesigns />
          <RecentImages />
        </aside>
      </div>
    </main>
  );
} 