import React from 'react';
import { motion } from 'framer-motion';

const FinancialModelSlide = ({ skipAnimations }) => {
  const financialData = [
    {
      category: 'TICKETING',
      years: ['$5,700,000', '$5,800,000', '$11,600,000', '$74,00,000', '$162,500,000']
    },
    {
      category: 'SPONSORSHIP',
      years: ['$800,000', '$2,100,000', '$3,200,000', '$3,800,000', '$4,100,000']
    },
    {
      category: 'MERCHANDISING',
      years: ['$600,000', '$900,000', '$1,900,000', '$9,100,000', '$18,800,000']
    },
    {
      category: 'FOOD & BEVERAGE',
      years: ['-', '$400,000', '$700,000', '$1,700,000', '$2,500,000']
    },
    {
      category: 'OTHER INCOME',
      years: ['-', '$400,000', '$500,000', '$600,0000', '$800,000']
    },
    {
      category: 'TOTAL',
      years: ['$7,100,000', '$9,600,000', '$17,800,000', '$89,800,000', '$188,600,000']
    }
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#f5f5f5]">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 py-16">
        <motion.div
          initial={skipAnimations ? { opacity: 1 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl"
        >
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-black text-center mb-12">
            THE FINANCIAL MODEL
          </h1>

          {/* Table */}
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full overflow-x-auto"
          >
            <table className="w-full border-collapse">
              {/* Header Row */}
              <thead>
                <tr>
                  <th className="bg-[#e8e8e8] border border-gray-300 p-4 text-left font-bold">
                    REVENUES
                  </th>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <th 
                      key={year}
                      className="bg-[#e8e8e8] border border-gray-300 p-4 text-center font-bold"
                    >
                      YEAR {year}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {financialData.map((row, index) => (
                  <motion.tr
                    key={row.category}
                    initial={skipAnimations ? {} : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  >
                    <td className="border border-gray-300 p-4 font-bold bg-white">
                      {row.category}
                    </td>
                    {row.years.map((value, idx) => (
                      <td 
                        key={idx}
                        className={`border border-gray-300 p-4 text-center bg-white ${
                          row.category === 'TOTAL' ? 'font-bold' : ''
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialModelSlide; 