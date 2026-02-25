const fs = require('fs');
const content = fs.readFileSync('app/results/page.tsx', 'utf8');
const fixedContent = content.replace(
  `                    </div>
                </motion.div>
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
        <motion.div`,
  `                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <motion.div`
);
fs.writeFileSync('app/results/page.tsx', fixedContent);
