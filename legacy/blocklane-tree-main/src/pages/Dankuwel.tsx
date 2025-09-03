export default function Dankuwel() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Dankuwel voor uw feedback
          </h1>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <p className="text-muted-foreground">
            Uw beoordeling is ontvangen en helpt ons om onze service te verbeteren.
          </p>
        </div>
      </div>
    </div>
  );
}