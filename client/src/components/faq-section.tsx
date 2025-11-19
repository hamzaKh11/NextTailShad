import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is ReelCutter really free?",
    answer:
      "Yes! ReelCutter is 100% free with no hidden fees, no subscriptions, and no limits on how many clips you can create. We believe in making video editing accessible to everyone.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No signup required! Just paste your YouTube URL and start creating clips immediately. We respect your privacy and don't require any personal information.",
  },
  {
    question: "What video quality will I get?",
    answer:
      "We download videos in the best quality available (up to 720p for most videos). Your clips will be optimized for social media platforms while maintaining excellent visual quality.",
  },
  {
    question: "How long can my clips be?",
    answer:
      "You can create clips of any length from the source YouTube video. Whether you need a 10-second teaser or a 5-minute segment, ReelCutter has you covered.",
  },
  {
    question: "Which aspect ratios are supported?",
    answer:
      "ReelCutter supports 9:16 (perfect for Reels and TikTok), 1:1 (Instagram posts), 16:9 (YouTube), and 4:5 (Facebook). Choose the format that fits your platform.",
  },
  {
    question: "Can I download copyrighted content?",
    answer:
      "You can download clips from any YouTube video, but you're responsible for ensuring you have the right to use the content. Always respect copyright laws and obtain permission when needed.",
  },
  {
    question: "How fast is the download process?",
    answer:
      "Most clips are processed and ready to download in under 30 seconds. Processing time depends on the video length and your internet connection speed.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely! We don't store your videos or personal data. All processing happens temporarily, and files are immediately deleted after download. Your privacy is our priority.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card hover-elevate"
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
