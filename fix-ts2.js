const fs = require('fs');
const content = fs.readFileSync('app/results/page.tsx', 'utf8');
const fixedContent = content.replace(
  `                    <motion.div
            className="flex flex-col gap-6 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >`,
  `                    <motion.div
                        className="flex flex-col gap-6 w-full"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >`
);
fs.writeFileSync('app/results/page.tsx', fixedContent);
