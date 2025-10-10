

import  { useState, useRef } from 'react';
import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import Text from "@/components/ui/custom/text";
import { metadata } from "@/config/metadata";
import { roomImage, roomMiniMap } from '@/assets';
import { Image } from '@/components/ui/custom/image';

const SeatBookingPage = () => {
  const breadcrumbItems = metadata.seatBookingPage.breadcrumbItems || [];
  // const [zoom, setZoom] = useState(1);
  // const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  

  // const handleMouseDown = (e) => {
  //   setIsDragging(true);
  //   setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  // };

  // const handleMouseMove = (e) => {
  //   if (isDragging) {
  //     setPosition({
  //       x: e.clientX - dragStart.x,
  //       y: e.clientY - dragStart.y
  //     });
  //   }
  // };

  const handleMouseUp = () => setIsDragging(false);



  return (
    <div className="min-h-[90vh] bg-gray-50">

      {/* Breadcrumb */}
      <MyBreadcrumb
        items={breadcrumbItems}
        title="General/PC Seat"
        showBackButton={true}
      />

      {/* Title */}
      <div className="p-4">
        <Text className="font-bold text-gray-600 text-lg">Lighthouse Lounge</Text>
      </div>

     

      {/* Seating Map */}
      <div
        ref={containerRef}
        className="relative mx-4 bg-white rounded-lg  overflow-hidden h-[60vh]"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            // transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
         <Image src={roomImage.rm566} alt="roomImage" width={500}/>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 flex items-center gap-8">
        <div className=''>
        <div className="flex items-center gap-2 pb-2">
          <div className="w-7 h-7 rounded-md bg-[#10b981]"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <div className="w-7 h-7 rounded-md bg-[#ef4444]"></div>
          <span className="text-sm">In Use</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#6b7280]"></div>
          <span className="text-sm">Fixed Seat</span>
        </div>
        </div>
        {/* Mini floor plan */}
        <div className="ml-auto">
          <Image src={roomMiniMap.rmNav566} alt='nav map' width={120} />
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;