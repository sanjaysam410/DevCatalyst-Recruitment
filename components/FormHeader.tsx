

export default function FormHeader() {
    return (
        <div className="max-w-[770px] mx-auto bg-white rounded-lg border border-gray-200 border-t-8 border-t-[#673ab7] shadow-sm mb-4">
            <div className="p-6 pt-5">
                <h1 className="text-[32px] leading-[40px] font-bold text-[#202124] mb-3">
                    DevCatalyst Recruitment Drive
                </h1>
                <div className="text-sm text-[#202124] whitespace-pre-wrap mb-4">
                    <p className="mb-2">
                        Join the team of passionate developers and creators!
                        We are looking for individuals who are ready to learn, build, and grow.
                    </p>
                    <p className="font-bold">
                        Deadline: Friday, 11:59 PM
                    </p>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <p className="text-xs text-[#d93025]">* Indicates required question</p>
            </div>
        </div>
    );
}
