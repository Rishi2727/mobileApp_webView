import MyBreadcrumb from "@/components/ui/custom/my-breadcrumb";
import { metadata } from "@/config/metadata";

const Notice = () => {
      const breadcrumbItems = metadata.notice.breadcrumbItems || [];
    
  return (
    <div>
        <MyBreadcrumb
        items={breadcrumbItems}
        title="University Notices"
        showBackButton={true}
      /></div>
  )
}

export default Notice