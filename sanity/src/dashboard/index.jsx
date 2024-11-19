import React, {useEffect, useState} from 'react'
import {Card, Heading, Text, Flex, Box, Stack} from '@sanity/ui'
import {fetchFirestoreData} from '../../config/firebase'

const MainplotztDashboard = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await fetchFirestoreData('testPurchase')
      setData(fetchedData)
    }
    fetchData()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        <Heading as="h2" size={3}>
          Mainplott Configurator Dashboard
        </Heading>
        <Text size={2}>Overview of recent purchases:</Text>

        <Stack space={5} marginTop={4}>
          {data.map((customer, index) => (
            <Card key={index} padding={4} radius={2} shadow={1} style={{border: '1px solid #ddd'}}>
              <Stack space={3}>
                {/* Customer Name and Order Date */}
                <Heading size={2}>Kunden Name: {customer.id}</Heading>
                <Text>Bestellung am {formatDate(customer.createdAt)}</Text>

                {/* Map over cartItems for multiple orders */}
                {customer.cartItems.map((item, orderIndex) => (
                  <Card
                    key={orderIndex}
                    padding={3}
                    radius={2}
                    shadow={1}
                    style={{border: '1px solid #ccc', marginTop: '10px'}}
                  >
                    <Flex gap={4} align="flex-start">
                      {/* Left Side: Product Details */}
                      <Box flex="1">
                        <Stack space={3}>
                          <Text>
                            <strong>Produktname:</strong> {item.productName}
                          </Text>
                          <Text>
                            <strong>Größe:</strong> {item.selectedSize}
                          </Text>
                          <Text>
                            <strong>Farbe:</strong> {item.selectedColor}
                          </Text>
                          <Text>
                            <strong>Menge:</strong> {item.quantity}
                          </Text>
                          {/* Zusatz Section */}
                          <Card
                            marginTop={3}
                            padding={3}
                            radius={1}
                            style={{background: '#f9f9f9'}}
                          >
                            <Stack space={2}>
                              <Heading size={1}>Zusatz</Heading>
                              <Text>
                                <strong>Profi-Datencheck:</strong>{' '}
                                {item.profiDatenCheck ? 'Ja' : 'Nein'}
                              </Text>
                              <Text>
                                <strong>Veredelung:</strong>{' '}
                                {item.sides?.front?.uploadedGraphic ? 'Ja' : 'Keine'}
                              </Text>
                              <Text>
                                <strong>Anmerkungen:</strong> {item.notes || 'Keine'}
                              </Text>
                            </Stack>
                          </Card>
                        </Stack>
                        <Card marginTop={4} padding={3} radius={1} style={{background: '#f3f3f3'}}>
                          <Stack space={3}>
                            <Heading size={1}>Detaillierte Vorschau</Heading>
                            <Flex gap={4}>
                              {/* Front Side */}
                              <Box>
                                <Text>Frontansicht:</Text>
                                {item.sides?.front?.uploadedGraphic ? (
                                  <a
                                    href={item.sides.front.uploadedGraphic.downloadURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={item.sides.front.uploadedGraphic.downloadURL}
                                      alt="Front Graphic"
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <Text>Keine Grafik hochgeladen</Text>
                                )}
                              </Box>

                              {/* Back Side */}
                              <Box>
                                <Text>Rückansicht:</Text>
                                {item.sides?.back?.uploadedGraphic ? (
                                  <a
                                    href={item.sides.back.uploadedGraphic.downloadURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={item.sides.back.uploadedGraphic.downloadURL}
                                      alt="Back Graphic"
                                      style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <Text>Keine Grafik hochgeladen</Text>
                                )}
                              </Box>
                            </Flex>
                          </Stack>
                        </Card>
                      </Box>

                      {/* Right Side: Large Preview Image */}
                      <Box flex="0 0 200px">
                        <Text>Vorschau:</Text>
                        <a href={item.configImage} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.configImage || item.selectedImage}
                            alt="Config Preview"
                            style={{
                              width: '100%',
                              height: 'auto',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                            }}
                          />{' '}
                        </a>
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

export default MainplotztDashboard
