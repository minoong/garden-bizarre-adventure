import axios from 'axios';

export interface TMapAddressInfo {
  city_do: string; // 시/도
  gu_gun: string; // 구/군
  eup_myun: string; // 읍/면
  legalDong: string; // 법정동
  ri: string; // 리
  bunji: string; // 번지
  roadName: string; // 도로명
  buildingIndex: string; // 건물번호
  buildingName: string; // 건물명
  mappingDistance: string; // 매핑거리
  roadCode: string; // 도로코드
}

export interface TMapReverseGeocodingResponse {
  addressInfo: TMapAddressInfo;
}

export interface ReverseGeocodingParams {
  latitude: number;
  longitude: number;
}

export interface FormattedAddress {
  newRoadAddr: string; // 새주소 (도로명)
  jibunAddr: string; // 지번주소
  latitude: number;
  longitude: number;
}

/**
 * T Map Reverse Geocoding API 호출
 * 위/경도 좌표를 주소로 변환
 */
export async function reverseGeocoding({ latitude, longitude }: ReverseGeocodingParams): Promise<FormattedAddress> {
  const appKey = process.env.NEXT_PUBLIC_TMAP_APP_KEY;

  if (!appKey) {
    throw new Error('TMAP_APP_KEY is not defined');
  }

  const response = await axios.get<TMapReverseGeocodingResponse>('https://apis.openapi.sk.com/tmap/geo/reversegeocoding', {
    params: {
      version: 1,
      format: 'json',
      coordType: 'WGS84GEO',
      addressType: 'A10',
      lon: longitude,
      lat: latitude,
    },
    headers: {
      appKey,
    },
  });

  const arrResult = response.data.addressInfo;

  // 법정동 마지막 문자
  const lastLegal = arrResult.legalDong.charAt(arrResult.legalDong.length - 1);

  // 새주소 (도로명 주소)
  let newRoadAddr = `${arrResult.city_do} ${arrResult.gu_gun} `;

  if (arrResult.eup_myun === '' && (lastLegal === '읍' || lastLegal === '면')) {
    // 읍면
    newRoadAddr += arrResult.legalDong;
  } else {
    newRoadAddr += arrResult.eup_myun;
  }

  newRoadAddr += ` ${arrResult.roadName} ${arrResult.buildingIndex}`;

  // 새주소 법정동 & 건물명 체크
  if (arrResult.legalDong !== '' && lastLegal !== '읍' && lastLegal !== '면') {
    // 법정동과 읍면이 같은 경우
    if (arrResult.buildingName !== '') {
      // 빌딩명 존재하는 경우
      newRoadAddr += ` (${arrResult.legalDong}, ${arrResult.buildingName})`;
    } else {
      newRoadAddr += ` (${arrResult.legalDong})`;
    }
  } else if (arrResult.buildingName !== '') {
    // 빌딩명만 존재하는 경우
    newRoadAddr += ` (${arrResult.buildingName})`;
  }

  // 구주소 (지번 주소)
  let jibunAddr = `${arrResult.city_do} ${arrResult.gu_gun} ${arrResult.legalDong} ${arrResult.ri} ${arrResult.bunji}`;

  // 구주소 빌딩명 존재
  if (arrResult.buildingName !== '') {
    jibunAddr += ` ${arrResult.buildingName}`;
  }

  return {
    newRoadAddr,
    jibunAddr,
    latitude,
    longitude,
  };
}
