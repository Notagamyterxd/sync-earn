{/* Cleaned CPX Research Offer Grid Item Card Component */}
<Card className="border-[#2e5c2e] bg-[#0c140c] text-white overflow-hidden shadow-md">
  <CardHeader className="bg-[#142414] border-b border-[#2e5c2e] flex flex-row items-center justify-between p-4">
    <div>
      <CardTitle className="text-lg font-bold text-[#4ade80]">CPX Research</CardTitle>
      <CardDescription className="text-gray-400 text-xs">Complete market research surveys to fund your account instantly.</CardDescription>
    </div>
  </CardHeader>
  <CardContent className="p-4 flex flex-col items-center justify-center min-h-[180px] bg-[#080d08]">
    <p className="text-sm text-gray-300 text-center mb-4">
      Ready to start earning Robux? Click below to open your secure survey panel.
    </p>
    <Button 
      asChild
      className="bg-[#2e5c2e] hover:bg-[#4ade80] text-white hover:text-black font-bold px-6, w-full"
    >
      {/* THIS LINK USES YOUR EXACT APP ID AND TRACKS USER EARNINGS CORRECTLY */}
      <a 
        href="https://cpx-research.com" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Start Earning
      </a>
    </Button>
  </CardContent>
</Card>
