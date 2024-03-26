const Cycle = () => (
  <div className="w-1/5 p-6">
    <div className="flex flex-col items-center space-y-2">
      <button className="items-center justify-center bg-gray-300 rounded-full w-20 h-20">
        Cycle 1
      </button>
      <button className="items-center justify-center bg-gray-300 rounded-full w-20 h-20">
        Cycle 2
      </button>
      <button className="items-center justify-center bg-gray-300 rounded-full w-20 h-20">
        Cycle 3
      </button>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

const Category = () => (
  <div className="w-1.5/5">
    <div className="flex flex-col items-center space-y-4 mx-5 p-4">
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        Machine Learning
      </button>
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        System Design
      </button>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

const SubCategory = () => (
  <div className="w-1.5/5">
    <div className="flex flex-col items-center space-y-4 mx-5 p-4">
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        Next.js
      </button>
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        NestJS
      </button>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

const Content = () => (
  <div>
    <div className="flex flex-col items-center space-y-4 shadow mx-5 p-4">
      <h3 className="font-bold mb-2">Cycle 1</h3>
      <ul className="list-inside list-disc space-y-3">
        <li>Data Fetching</li>
        <li>Rendering</li>
        <li>Caching</li>
      </ul>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

export default function LongTerm() {
  return (
    <div className="flex">
      <Cycle />
      <Category />
      <SubCategory />
      <Content />
    </div>
  );
}
