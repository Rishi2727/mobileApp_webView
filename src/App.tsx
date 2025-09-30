import MyBreadcrumb from './components/ui/custom/my-breadcrumb'

function App() {

  const breadcrumbItems = [
    { id: 1, label: "Dashboard" },
    { id: 2, label: "General/PC Seat" }
  ]

  return (
      <MyBreadcrumb
        title="General/PC Seat"
        showBackButton={true}
        items={breadcrumbItems}
      />
  )
}

export default App
