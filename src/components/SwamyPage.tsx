import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, MapPin, Calendar, Users, BookOpen,
  Heart, Star, Globe, Scroll, Award, Leaf
} from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import ScrollVelocity from './ScrollVelocity';

import mounaSwamiPortrait from '../assets/mouna-swami-portrait-1.jpg';
import vimalanandaPortrait from '../assets/vimalananda-bharati-portrait.jpg';
import trivikramaPortrait from '../assets/trivikrama-ramananda-standing.jpg';
import sivaChidanandaPortrait from '../assets/siva-chidananda-standing.jpg';
import peethadhipathiImage from '../assets/peethadhipathi-updated.png';
import datteshwaranandaImage from '../assets/datteshwarananda-final.jpg';

/* ─── Data ──────────────────────────────────────────────── */

type LucideIcon = typeof MapPin;

interface Contribution {
  Icon: LucideIcon;
  title: string;
  description: string;
}

interface SwamiData {
  name: string;
  fullName: string;
  year: string;
  period: string;
  title: string;
  born: string;
  departed: string;
  birthplace: string;
  parents: string;
  epitaph: string;
  pullQuote: string;
  story: string[];
  contributions: Contribution[];
  gallery: { image: string; caption: string }[];
  image: string;
}

const SWAMI_FULL_DATA: SwamiData[] = [
  {
    name: 'Sri Mouna Swamy',
    fullName: 'Sri Sri Sri Sivachidananda Saraswati Swami',
    year: '1916 – 1943',
    period: 'Founder & First Peethadhipathi',
    title: 'Founder & Silent Sage',
    born: '1868, Nunnevari Palem, Prakasam District, Andhra Pradesh',
    departed: '1943, Courtallam',
    birthplace: 'Nunnevari Palem, Prakasam District, Andhra Pradesh',
    parents: 'Achyutuni Bapanayya & Seetamma',
    epitaph: 'Who spoke the loudest truths through absolute silence.',
    pullQuote: '"Silence is not the absence of sound — it is the presence of God."',
    story: [
      'Sri Mounaswamy was born in 1868 to the pious couple Achyutuni Bapanayya and Seetamma in Nunnevari Palem, Prakasam District, Andhra Pradesh. His birth name was Pichayya (Poorvashrama Namam – the name before taking Sanyasa Deeksha). Later, he was adopted by close relatives, renamed as Sivayya, and relocated to Pandillapalli village in the same district.',
      'From childhood Sri Sivayya had his interests inclined towards Bharatam, Bhagavatam and other Hindu texts. Blessed with melodious voice Sivayya used to recite the slokas and sing devotional songs that resonated across the community, naturally attracting devotees to his presence.',
      'In due Course Sri Sivayya married Smt Kameswaramma and was blessed with one son and two daughters, he worked in the State Excise department till 1894 after which he moved to Rajahmundry and served private vysya businessman.',
      'Guided by the impressions of his Purvajanma Samskaras, Sivayya frequently visited temples and attended discourses on Hindu philosophy. These experiences deepened his sense of Vairagya (detachment from worldly desires). His encounters with ascetics and discussions on Advaita and Vedanta further strengthened his resolve to renounce material life.',
      'Sivayya contemplated deeply on the transient nature of birth, death, family, and old age. He realized that every human is inherently Brahman, but due to Maya and the influence of the Arishadvargas (Kama – desire, Krodha – anger, Lobha – greed, Moha – delusion, Mada – ego, Matsarya – jealousy), few recognize this truth. Having already attained the state of renunciation mentally, he resolved to step away from Samsara Bandham (worldly bondage).',
      'Sivayya Constantly Reflected the "Naham deho nendriyanyantarangaha Nahaho prano nasti karma na buddhihi: Darapatya kshetra vittadi dooraha Sakshi Nityaha pratyagatma sivoham" Which meant "I am not the body, not the senses, not the mind, nor the life-breath or intellect. I am beyond action, beyond worldly ties of family, wealth, and possessions. I am the eternal witness, the inner Self. I am Siva." With this realization, Sivayya set out towards the Himalayas for penance.',
      'On his journey, Sivayya reached Naimisharanyam, where he had darshan of Vyasa Gaddi and other sacred places. Continuing onward to the Barabanki caves, he met a remarkable yogi – short, muscular, with hair covering his body, resembling a bear. This yogi was Sri Venkatachalam Pantulu (Venkatachala Yogi), who had lived there for centuries.',
      'Sivayya devoted himself to serving the yogi, accompanying him through sun and storm, much like Hanuman\'s service to Lord Rama. Venkatachala Yogi often remained in deep Samadhi for days together, while Sivayya cared for him with unwavering devotion. One day, the yogi blessed Sivayya, assuring him that his destiny was safeguarded by the Almighty. He revealed that he would soon leave his physical body and instructed Sivayya to perform his Uttarakriyas (last rites). With reverence and obedience, Sivayya carried out the sacred rites of Venkatachala Yogi.',
      'After completing the uttarakriyas of Venkatachala Yogi, Sivayya resumed his journey and reached the Himalayas. There, he discovered a serene ashram led by Sri Achyutananda Saraswati Swami, a great Mahasiddha of the Dattatreya Sampradaya. Sri Achyutananda Saraswati Swami was a realized master who knew his lineage (Janma Parampara) spanning 25,000 years. He had attained the divine sakshatkara (vision) of Sri Siddeshwari Devi, the primordial goddess and source of all the Dasamahavidyas.',
      'Sri Achyutananda Saraswati Swami graced Sivayya with Sanyasa Deeksha, bestowing upon him the name Sri Sivachidananda Saraswati Swami. During his time in the ashram, he was introduced to Swami Nikhileswarananda and Swami Visudhananda of Siddhashramam. Achyutananda Saraswati Swami instructed Sivachidananda Saraswati Swami to perform Penance with them in certain places of Himalayas.',
      'In the sacred Himalayas, Sri Sivachidananda Saraswati Swami experienced profound spiritual revelations and attained divine powers. After completing his penance, he returned to his Guru for darshan and expressed his desire to stay in Himalayas and intensify the penance and requested for the acceptance of guru. His Guru gently reminded him of the greater mission awaiting him—for the upliftment of mankind. He was instructed to journey south via Kashi (Varanasi), accompanied by Swami Visudhananda, and instructed to seek darshan of Sri Vasudevananda Saraswati Swami (Tembe Swamy) in Maharashtra.',
      'Sri Sivachidananda Saraswati Swami continued his penance in the sacred land of Kaasi (Varanasi/Benaras), and resumed his journey to Kedarnath, and Badrinath. During his pilgrimage, he came across a panditha sabha (scholars\' meeting), which at one point took an ugly turn and devolved into an acrimonious debate. Sri Sivachidananda Saraswati Swami interjected and brought the dispute to a logical conclusion. This logical conclusion sparked rivalry among the scholars, who resolved to file a complaint against Sivachidananda Saraswati Swami to his guru, Sri Achyutananda Saraswati Swami.',
      'As instructed by his Guru Sri Sivachidananda Saraswati Swami entered Maharashtra, and met Sri Vasudevananda Saraswati Swami (Tembe Swamy), who showered him with affection and care. Sivachidananda Saraswati continued his penance near Tembe Swamy. After completing the penance near Tembe Swamy, Sri Sivachidananda Saraswati Swami met Shirdi Sai Baba. It is believed that during this time, Sri Sivachidananda Saraswati Swami imparted Kandayoga to Sai Baba.',
      'Sri Sivachidananda Saraswati Swami resumed his journey towards the south, and while performing Narasimha Sadhana, he was blessed with Narasimha Sakshatkara. From there, he moved to one of the prominent Datta Kshetras, and while he was in Dhyana at night, his guru, Sri Achyutananda Saraswati Swami, gave him Darshan and said, "Siva! I learnt about your participation in a debate; they have made numerous allegations about you; I am not contemplating any of them, but I do see your future. Don\'t waste your time on these disputes, and it\'s even better if you don\'t attend them. As you know, the power of remaining quiet/calm (Mouna) is endless."',
      'Sri Sivachidananda Saraswati Swami politely offered Pranams to his Guru and said, "Gurudeva!" I understand your intentions; starting today, I will not only participate in the debates, but I will also refrain from speaking. I shall remain tranquil (Mouna), and through Mouna, I will enlighten the devotees and their spiritual welfare. Sri Achyutananda Saraswati Swami placed his hand on the head of Sri Mounaswamy. Showered him with blessings, earning him the appellation Sri Mounaswamy.',
      'On his way to the temple through deep, dense woodland, Sri Mounaswamy prayed to Mookambika Devi for guidance as the forest environment became increasingly dark. In no time, a woman with shyamala varna (dark complexion) appeared and informed Mounaswamy that she stays in the same temple and knew the route to the temple. When they were about to arrive at the temple in the morning, the women vanished, and it is believed that Sri Mokkambika Ammavaru herself came to grace Sri Mounaswamy.',
      'In 1906, Mounaswamy arrived at Tiruvannamalai, performing penance in the Pathalalinga caves which were just beside where Bhagwan Ramana Maharshi used to perform penance. Out of affection, Mounaswamy offered a coconut shell to Maharshi. Even later, Ramana Maharshi would inquire about Mounaswamy whenever visitors from Courtallam came to Tiruvannamalai.',
      'Sri Mounaswamy reached his destination Courtallam. Mounaswamy continued his penance at Dharani Peetam, established by Sage Agastya. The principal deities here are Venu Vagvadini Devi and Courtala Natheswarudu, along with the sacred Sri Chakra Meruprastaram worshipped by Lopamudra. Devotees revered Mounaswamy as Siddha and Yogi, and received his divine blessings.',
      'Mounaswamy sustained his physical body with the temple prasadam, the money which is required for purchasing the prasadam was manifested by simply shaking his hands. Mounaswamy frequently immersed in Samadhi Sthithi. Unwilling to disturb, temple authorities used to lock the doors from outside. Even if the doors were locked, Mounaswamy would still enter and exit. People frequently discover Mounaswamy in Samadhi Sthithi after entering. People were stunned by this, and word of Mounaswamy began to spread.',
      'In 1909, Sri Sacchidananda Shivabhinava Nrisimha Bharati Mahaswamiji, the 33rd Pontiff of Sringeri Sharada Peetam, was observing Chaturmasya Deeksha at Papanasam near Ambasamuthram. Mounaswamy had darshan of the Sringeri Acharya, who instructed him to establish an ashram in Courtallam, recognizing it as an ideal place for penance. This divine instruction led to the establishment of Sri Siddeshwari Peetam, which continues to inspire seekers and devotees to this day.',
      'The Zamindar of Sethur, Sri Chevuka Pandya Tevur, together with devotee Sri Sundaram Iyer, generously donated lands for the construction of the temple. On 7 October 1910, Sri Mounaswamy ceremoniously installed the idol of Sri Dandayudha Pani, performing all rituals according to Vedic traditions. During the installation, Mounaswamy miraculously created nine gems with his bare hands, which were placed beneath the idol. A divine ray of light emanated from Sri Dandayudha Pani and remained for a long time, blessing devotees with its radiance.',
      'In 1916 on 3rd October, at the newly constructed Dattatreya Mattam, Sri Mounaswamy installed the idols of Sri Siddeshwari Devi (Sri Raja Rajeswari Ambal) and Sri Kameswara Swamy. And also consecrated the Sanjeevara Hanuman on the north side of peetam and also consecrated Sri Valli Devasena Sametha Kumaraswamy and Sri Ayyappa.',
      'In 1919, Mounaswamy wished to install the idols of Sri Seeta Rama, Sanatana Venu Gopala Swamy, and Yoga Narasimha. These installations were performed in full accordance with Vedic traditions, with the participation of the 25th Pontiff of Nanganuri Vanamamalai Mattam, Sri Kalyana Vanamamalai Ramanujajeeyar Swami.',
      'In 1938, Sri Mounaswamy installed the idol of Sri Ganapathi. After the rituals concluded, devotees observed a pulse-like sound emanating from the idol. Scientists and local authorities inspected and confirmed the phenomenon, declaring that the sound was naturally occurring. From then on, the idol became revered as "Naadi Ganapathi." The significance of Naadi Ganapathi drew attention from far and wide. The Governor of Madras, Sir Archibald Nye, visited the Peetam with his wife, offered prayers, and expressed deep devotion.',
      'Originally established as Dattatreya Mattam in 1910, the institution was reorganized as Sri Siddheswari Peetam in 1936 by Sri Mounaswamy, following the Shankara Sampradaya.',
      'In the later years, Sri Mounaswamy\'s health began to decline. On 28th December 1943 at 2:15 AM, Mounaswamy attained Mahasamadhi, leaving his physical body. All uttarakriyas were performed in accordance with Vedic traditions. In 1951, a Neelakanteswara Lingam was established on his Samadhi by the then pontiff, H.H. Sri Trivikramaramananda Bharathi Swamy.',
    ],
    contributions: [
      { Icon: MapPin, title: 'Himalayan Penance & Guru Darshan', description: 'Performed intense penance in the Himalayas, served Venkatachala Yogi, and received Sanyasa Deeksha from Achyutananda Saraswati Swami of the Dattatreya Sampradaya.' },
      { Icon: Leaf, title: 'Mouna Vratam Initiation', description: 'Received the divine instruction to observe Mouna (silence) as the path to enlightenment, earning the appellation Sri Mounaswamy.' },
      { Icon: BookOpen, title: 'Spiritual Encounters', description: 'Had darshan of Tembe Swamy, Shirdi Sai Baba, Narasimha Sakshatkara, Mookambika Devi guidance, and association with Ramana Maharshi.' },
      { Icon: Heart, title: 'Miraculous Manifestations', description: 'Demonstrated divine powers including manifestation of money for prasadam and entering locked temples while in Samadhi.' },
      { Icon: Star, title: 'Peetham Establishment', description: 'Founded Sri Siddheswari Peetham in 1910, installed divine idols with miraculous events, and reorganized it following Shankara Sampradaya in 1936.' },
      { Icon: Globe, title: 'Naadi Ganapathi Miracle', description: 'Installed the Naadi Ganapathi idol in 1938, which emanates a natural pulse-like sound, drawing devotees and officials including the Governor of Madras.' },
    ],
    gallery: [
      { image: mounaSwamiPortrait, caption: 'Sri Mouna Swamy — The Silent Sage' },
      { image: 'https://picsum.photos/seed/courtallam1/600/400', caption: 'Courtallam Peetham' },
      { image: 'https://picsum.photos/seed/sacred2/600/400', caption: 'Morning Puja Rituals' },
      { image: 'https://picsum.photos/seed/temple3/600/400', caption: 'Ancient Temple Gopuram' },
      { image: 'https://picsum.photos/seed/vedic4/600/400', caption: 'Vedic Chanting' },
      { image: 'https://picsum.photos/seed/nature5/600/400', caption: 'Courtallam Falls' },
    ],
    image: mounaSwamiPortrait,
  },
  {
    name: 'Sri Vimalananda Bharathi',
    fullName: 'Swami Vimalananda Bharathi Saraswati',
    year: '1944 – 1950',
    period: 'First Peethadhipathi (after Mounaswamy)',
    title: 'First Pontiff & Brahmanistha',
    born: 'August 20, 1878, Chemudupadu, Krishna District',
    departed: 'January 25, 1950',
    birthplace: 'Chemudupadu, Krishna District, Andhra Pradesh',
    parents: 'Surya Narayana & Adilakshmi',
    epitaph: 'Who brought the light of Brahmagnana to Sri Siddheswari Peetham after Mounaswamy.',
    pullQuote: '"True self-realization is found when the heart is released from worldly bonds."',
    story: [
      'Sri Vimalananda Bharathi Swamy, originally named Trivikramarama Rao, was born on August 20, 1878, in Chemudupadu village, Krishna District. He was the son of Surya Narayana and Adilakshmi.',
      'He pursued his education in Bandaru town (Vijayawada) and later served as a teacher at the Noble High School. During his tenure as a teacher, he mentored several distinguished personalities, including Viswanadha Satyanarayana and Pingali Lakshmikantam, who went on to become renowned figures in Telugu literature.',
      'After his teaching career, Sri Trivikramarama Rao moved to Tiruvananthapuram to pursue a Law degree. His quest for knowledge extended beyond academics into the realm of spiritual research. He dedicated himself to the study of Sutrabhashyam, guided by the divine presence of Sringeri Acharya Sri Nrusimha Bharathi Swamy and the esteemed scholar Vadapalli Pattabhiramayya.',
      'The speeches of Sri Vimalananda Bharathi Swamy on the Upanishads, Brahmasutras, and Bhagavad Gita are considered timeless and a must-listen for all sincere seekers.',
      'In his middle age, Sri Trivikramarama Rao was profoundly influenced by Donthulamma (Donthurulamma). He came to believe that true Atmadarshana (self-realization) could not be attained while bound by the ties of worldly life (samsara bandha). Determined to put the principles of Tattvika Bodha into practice, he resolved to embrace the path of renunciation.',
      'He was initiated into Sanyasadeeksha by the then Pontiff of Sringeri Virupaksha Peetam Sri Kalyanananda Bharathi Swamy, who bestowed upon him the name Vimalananda Bharathi Swamy. From then on, he lived as a shining example of Brahmagnana and Brahmanistha, continuing to spread the light of Tattvaprabodham.',
      'Sri Vimalananda Bharathi Swamy nurtured a deep interest in poetry in his childhood and composed numerous devotional verses dedicated to the Almighty. However, as his vairagya intensified, he gradually relinquished all desire for worldly comforts, power, wealth, and even poetry itself, immersing fully in spiritual pursuit.',
      'Following the Mahasamadhi of Mounaswamy, Sri Vimalananda Bharathi Swamy assumed the responsibilities of spiritual leadership and became the first Pontiff of Sri Siddheswari Peetam. He continued his teachings on Brahmagnana with unwavering dedication until he attained siddhi on January 25, 1950.',
    ],
    contributions: [
      { Icon: Star, title: 'First Pontiff of the Peetham', description: 'Assumed spiritual leadership of Sri Siddheswari Peetam after the Mahasamadhi of Sri Mouna Swamy.' },
      { Icon: Users, title: 'Mentor to Scholars', description: 'Selflessly mentored Viswanadha Satyanarayana and Pingali Lakshmikantam during his early teaching career.' },
      { Icon: BookOpen, title: 'Teaching of the Upanishads', description: 'Delivered timeless discourses on the Upanishads, Brahmasutras, and Bhagavad Gita.' },
      { Icon: Scroll, title: 'Sutrabhashyam Studies', description: 'Studied and propagated the wisdom of Sutrabhashyam under the guidance of Sringeri Acharya Sri Nrusimha Bharathi Swamy.' },
      { Icon: Heart, title: 'Renunciation & Detachment', description: 'Embraced sanyasa and renounced worldly desire, life, and even poetry to live wholly in spiritual pursuit.' },
      { Icon: Globe, title: 'Tattvaprabodham Light', description: 'Spread the light of Tattvaprabodham and Brahmagnana as a living example of Brahmanistha.' },
    ],
    gallery: [
      { image: vimalanandaPortrait, caption: 'Sri Vimalananda Bharathi' },
      { image: 'https://picsum.photos/seed/patasala1/600/400', caption: 'Veda Patasala — Morning Study' },
      { image: 'https://picsum.photos/seed/library2/600/400', caption: 'Ancient Manuscript Collection' },
      { image: 'https://picsum.photos/seed/discourse3/600/400', caption: 'Vedic Discourse' },
      { image: 'https://picsum.photos/seed/temple4/600/400', caption: 'Temple Corridor' },
      { image: 'https://picsum.photos/seed/ceremony5/600/400', caption: 'Puja Ceremony' },
    ],
    image: vimalanandaPortrait,
  },
  {
    name: 'H.H Sri Trivikramaramananda Bharathi Swamy',
    fullName: 'Sri Trivikramaramananda Bharathi Saraswati Swamy',
    year: '1950 – 1991',
    period: 'Second Peethadhipathi',
    title: 'Second Pontiff & Spiritual Reformer',
    born: 'September 14, 1901, Turpu Chittoor village, Krishna District',
    departed: 'July 23, 1991',
    birthplace: 'Turpu Chittoor, Krishna District, Andhra Pradesh',
    parents: 'Chinna Perraju & Venkayamma',
    epitaph: 'Whose voice carried the grace of Lalitha Sahasranama across the Peetham.',
    pullQuote: '"Renunciation is not the loss of the world, but the discovery of the Self beyond it."',
    story: [
      'Sri Trivikramaramananda Bharathi Swamy was born on September 14, 1901, in Turpu Chittoor village, Krishna District, Andhra Pradesh, and was named Ramakrishna Rao. He was the son of Chinna Perraju and Venkayamma.',
      'He pursued his early studies under Kanukollu Trivikramarao and went on to complete his F.A. and B.A. degrees at Noble College, Bandaru. Later he obtained his Law degree from Hindu University, Kashi.',
      'While flourishing in his career as a lawyer, his revered guru Sri Trivikrama Rao embraced Sanyasadeeksha and became the first Pontiff of Sri Siddheswari Peetam. Inspired by his guru\'s renunciation, Sri Ramakrishna Rao gave up his legal practice and joined the Peetam as its Manager.',
      'In 1950, he took Sanyasadeeksha from his Guru Sri Vimalananda Bharathi Swamy and received the monastic name Trivikramaramananda Bharathi Swamy. Following the siddhi of Sri Vimalananda Bharathi Swamy, he became the second Pontiff of Sri Siddheswari Peetam.',
      'Blessed with a melodious voice, Sri Trivikramaramananda Bharathi Swamy\'s recitations of slokas and the Lalitha Sahasranama Stotram resonated deeply within the community, drawing devotees to his presence.',
      'His archana to Siddheswari Ammavaru, performed with the chanting of Lalitha Sahasranama, was revered as if sages like Hayagriva or Agastya themselves had come to perform the sacred rituals.',
      'During his tenure, he traveled extensively across India (Bharat), spreading the message of Veda Dharma and delivering numerous discourses. His spiritual leadership brought widespread acclaim to Sri Siddheswari Peetam, strengthening its role as a beacon of devotion and knowledge.',
      'On January 12, 1991, Sri Trivikramaramananda Bharathi Swamy announced Sri Bandhakavi Seetarama Anjaneyulu, a renowned lawyer from Tanuku, as his successor-designate. He initiated him into Sanyasadeeksha and bestowed upon him the name Sri Sivachidananda Bharathi.',
      'He attained siddhi on July 23, 1991, leaving behind a legacy of devotion, sound, and deep spiritual commitment.',
    ],
    contributions: [
      { Icon: Star, title: 'Second Pontiff of the Peetham', description: 'Served as the second Pontiff of Sri Siddheswari Peetam following the siddhi of Sri Vimalananda Bharathi Swamy.' },
      { Icon: Heart, title: 'Melodious Lalitha Sahasranama', description: 'Blessed devotees with powerful recitations of Lalitha Sahasranama and devotional slokas.' },
      { Icon: BookOpen, title: 'Veda Dharma Discourses', description: 'Traveled widely across Bharat delivering numerous discourses on the message of Veda Dharma.' },
      { Icon: Users, title: 'Guru & Successor', description: 'Initiated Sri Bandhakavi Seetarama Anjaneyulu as his successor, who became Sri Sivachidananda Bharathi.' },
      { Icon: Globe, title: 'Spiritual Leadership', description: 'Strengthened the Peetham as a beacon of devotion, knowledge, and traditional ritual excellence.' },
    ],
    gallery: [
      { image: trivikramaPortrait, caption: 'H.H Sri Trivikramaramananda Bharathi Swamy' },
      { image: 'https://picsum.photos/seed/lalitha1/600/400', caption: 'Lalitha Sahasranama Recitation' },
      { image: 'https://picsum.photos/seed/archana2/600/400', caption: 'Archana to Siddheswari Ammavaru' },
      { image: 'https://picsum.photos/seed/discourse3/600/400', caption: 'Veda Dharma Discourse' },
      { image: 'https://picsum.photos/seed/travel4/600/400', caption: 'Pilgrimage Journey' },
      { image: 'https://picsum.photos/seed/successor5/600/400', caption: 'Succession Ceremony' },
    ],
    image: trivikramaPortrait,
  },
  {
    name: 'Sri Sivachidananda Bharathi Swamy',
    fullName: 'Sri Sivachidananda Bharathi Saraswati Swami',
    year: '1991 – 2002',
    period: 'Third Peethadhipathi',
    title: 'Yogi & Visionary',
    born: 'September 22, 1929, Tanuku, Andhra Pradesh',
    departed: 'December 17, 2002',
    birthplace: 'Tanuku, Andhra Pradesh',
    parents: 'Sri Venkataramayya & Smt. Subhadramma',
    epitaph: 'Abhinava Mounaswamy whose legal wisdom strengthened the Peetham.',
    pullQuote: '"Inclusivity and harmony are the true foundations of spiritual strength."',
    story: [
      'Sri Sivachidananda Bharathi Swamy, originally named Bandhakavi Seetaramanjaneyalu, was born on September 22, 1929 in Tanuku, Andhra Pradesh. He was the son of Sri Venkataramayya and Smt. Subhadramma.',
      'He pursued his education in Bheemavaram, Tanuku, and Visakhapatnam, later establishing himself as a distinguished lawyer and master in the field of law.',
      'Alongside his professional career, he actively contributed to society through organizations such as the Rashtriya Swayamsevak Sangh (RSS), Viswa Hindu Parishad, Rotary Club, Brahmanaseva Sangam, and Nannaya Bhattaraka Peetam.',
      'Sri Bandhakavi Seetaramanjaneyalu was initiated into Sanyasadeeksha by Sri Trivikramaramananda Bharathi Swamy, who bestowed upon him the name Sri Sivachidananda Bharathi Swamy. Following the siddhi of his Guru, he ascended as the Third Pontiff of Sri Siddheswari Peetam.',
      'With his profound expertise in law, Swamiji resolved numerous legal matters concerning the Peetam and its sister organizations, bringing financial stability and enabling the merging of several temples under the Peetam’s administration.',
      'Devotees lovingly referred to him as “Abhinava Mounaswamy.” He was also a master in Vasthu Shastra and Jyotishya, and during his tenure he oversaw the reconstruction of many temples and the establishment of new ones, strengthening the spiritual foundation of the Peetham.',
      'Sri Sivachidananda Bharathi Swamy maintained cordial relations with people of diverse religions and practices, embodying inclusivity and harmony. He worked tirelessly for the upliftment of the Brahmin community, organising meetings and initiatives aimed at their development.',
      'In 2002, Swamiji announced Sri Prasadaraya Kulapati, a renowned educationist from Guntur, as his successor, initiated him into Sanyasadeeksha, and bestowed upon him the name Sri Siddheswarananda Bharathi Swamy. He attained Mahasamadhi on December 17, 2002.',
    ],
    contributions: [
      { Icon: Globe, title: 'Legal Stewardship', description: 'Resolved legal matters for the Peetam and its sister organisations, strengthening financial stability.' },
      { Icon: Star, title: 'Temple Reconstruction', description: 'Spearheaded the reconstruction of many temples and the establishment of new sacred centres.' },
      { Icon: Scroll, title: 'Vasthu & Jyotishya', description: 'Applied his mastery of Vasthu Shastra and Jyotishya to deepen the Peetham’s spiritual infrastructure.' },
      { Icon: Heart, title: 'Inclusive Harmony', description: 'Maintained cordial relations with diverse religions and embodied harmony in every initiative.' },
      { Icon: Users, title: 'Community Upliftment', description: 'Worked tirelessly for the upliftment of the Brahmin community through meetings and development initiatives.' },
      { Icon: BookOpen, title: 'Successor Designation', description: 'Initiated Sri Prasadaraya Kulapati as Sri Siddheswarananda Bharathi Swamy, ensuring continuity of leadership.' },
    ],
    gallery: [
      { image: sivaChidanandaPortrait, caption: 'H.H Sri Sivachidananda Bharathi Swamy' },
      { image: 'https://picsum.photos/seed/legal1/600/400', caption: 'Legal Guidance for the Peetham' },
      { image: 'https://picsum.photos/seed/temple2/600/400', caption: 'Temple Reconstruction' },
      { image: 'https://picsum.photos/seed/vasthu3/600/400', caption: 'Vasthu Shastra Planning' },
      { image: 'https://picsum.photos/seed/harmony4/600/400', caption: 'Interfaith Harmony' },
      { image: 'https://picsum.photos/seed/successor5/600/400', caption: 'Successor Initiation Ceremony' },
    ],
    image: sivaChidanandaPortrait,
  },
  {
    name: 'H.H Sri Siddheswarananda Bharati Swamy',
    fullName: 'Sri Siddheswarananda Bharati Saraswati Swami',
    year: '2002 – Present',
    period: 'Fourth Peethadhipathi (Current)',
    title: 'Scholar, Yogi & Spiritual Guardian',
    born: 'January 23, 1937, Elchur village, Guntur District',
    departed: 'In Blessed Life',
    birthplace: 'Elchur, Guntur District, Andhra Pradesh',
    parents: 'Sri Potharaju Purushotthama Rao & Smt. Swarajya Lakshmi',
    epitaph: 'A living flame of poetry, yogic power, and divine vision for Sri Siddheswari Peetham.',
    pullQuote: '"True spiritual power is revealed in service, vision, and the discipline of the heart."',
    story: [
      'Born as Dr. Prasada Raya Kulapathi (Venkata Lakshmi Vara Prasad Rao) on January 23, 1937 in Elchur village, Guntur District, he is the son of Sri Potharaju Purushotthama Rao, a great poet, and Smt. Swarajya Lakshmi.',
      'He ascended the throne of Sri Siddheswari Peetham on Datta Jayanthi, December 19, 2002, becoming the fourth Peethadhipathi and continuing the sacred lineage with deep scholarship and devotion.',
      'A distinguished scholar, poet, and former principal of Hindu College, Guntur, he has received numerous literary titles including Avadhana Saraswathi, Chakravarthi Sahithi Sarvabhauma, and Kavitha Sudhakara.',
      'He has contributed several poetic works such as Siva Sahasri, Ambica Sahasri, Kavya Kantha, and novels like Vraja Bhagavatham, enriching the devotional and literary heritage of the Peetham.',
      'A great yogi with mastery over multiple mantras, he received initiation from Sri Pasumamula Subbaraya Sastry and obtained Naaga mantra siddhi. He has been blessed with divine visions of Prachandachandi, Lord Shiva, Radha Devi, Chinna Masta, Matangi-Syamala Devi, and Kali.',
      'He possesses extraordinary spiritual powers, including knowledge of past births and healing abilities, and he established Swayam Siddha Kali Peetham in Guntur for a 600-year-old Kali idol that came to him through the cosmos.',
    ],
    contributions: [
      { Icon: BookOpen, title: 'Scholarly Leadership', description: 'Former principal of Hindu College, Guntur, and recipient of celebrated literary titles for his poetry and scholarship.' },
      { Icon: Star, title: 'Devotional Literature', description: 'Authored works like Siva Sahasri, Ambica Sahasri, Kavya Kantha, and Vraja Bhagavatham.' },
      { Icon: Heart, title: 'Yogic Power & Vision', description: 'Mastered multiple mantras and received divine visions of Prachandachandi, Shiva, Radha Devi, Chinna Masta, Matangi-Syamala Devi, and Kali.' },
      { Icon: Globe, title: 'Temple & Peetham Expansion', description: 'Established Swayam Siddha Kali Peetham in Guntur and strengthened the Peetham’s spiritual infrastructure.' },
      { Icon: Users, title: 'Devotee Guidance', description: 'Continues to bless devotees with poetic wisdom, scholarly teachings, and spiritual healing.' },
      { Icon: Leaf, title: 'Spiritual Continuity', description: 'Leads Sri Siddheswari Peetham as a living flame while preserving the tradition and expanding its reach.' },
    ],
    gallery: [
      { image: peethadhipathiImage, caption: 'H.H Sri Siddheswarananda Bharati Swamy' },
      { image: 'https://picsum.photos/seed/poetry1/600/400', caption: 'Poetic Discourse' },
      { image: 'https://picsum.photos/seed/mantra2/600/400', caption: 'Mantra Blessing' },
      { image: 'https://picsum.photos/seed/vision3/600/400', caption: 'Divine Vision' },
      { image: 'https://picsum.photos/seed/kali4/600/400', caption: 'Swayam Siddha Kali Peetham' },
      { image: 'https://picsum.photos/seed/service5/600/400', caption: 'Devotee Blessing' },
    ],
    image: peethadhipathiImage,
  },
  {
    name: 'Sri Datteshwarananda Bharati',
    fullName: 'Sri Datteshwarananda Bharati Saraswati',
    year: 'Successor',
    period: 'Uttaradhikari (Designated Successor)',
    title: 'Healer-Turned-Spiritual Guide',
    born: 'Formerly Dr. Kadambari Aravind',
    departed: 'In Blessed Life',
    birthplace: 'Northern India',
    parents: 'Details preserved in Peetham archives',
    epitaph: 'From healing bodies to healing souls, he carries the lineage forward with compassion.',
    pullQuote: '"The wisdom of dharma shines brightest when it is shared with both medical care and spiritual care."',
    story: [
      'H.H Sri Datteshwarananda Bharati Swamy, formerly known as Dr. Kadambari Aravind, served as a dedicated medical officer in northern India before embracing the path of Sanyasa.',
      'His journey from healing bodies to healing souls reflects a profound spiritual calling and a deep commitment to the welfare of all beings.',
      'As the Uttaradhikari (successor) of Sri Siddheswari Peetham, he represents the continuation of the sacred lineage established by Mouna Swamy.',
      'With a unique background combining modern medical knowledge and ancient spiritual wisdom, he is committed to selflessly strengthening the propagation of dharma and upholding the spiritual legacy of the Peetham.',
      'His mission encompasses preserving traditional teachings while making them accessible to contemporary seekers, ensuring the timeless wisdom of Sri Siddheswari Peetham continues to guide future generations.',
    ],
    contributions: [
      { Icon: Star, title: 'Uttaradhikari Designate', description: 'Designated successor of Sri Siddheswari Peetham, carrying the sacred lineage forward.' },
      { Icon: Heart, title: 'Medical to Spiritual Service', description: 'Transitioned from dedicated medical service to the path of Sanyasa and spiritual service.' },
      { Icon: Globe, title: 'Dharma Strengthening', description: 'Committed to selflessly strengthening the propagation of dharma for all seekers.' },
      { Icon: BookOpen, title: 'Bridging Knowledge', description: 'Combines modern medical knowledge with ancient spiritual wisdom for devotee welfare.' },
      { Icon: Users, title: 'Accessible Tradition', description: 'Preserves traditional teachings while making them accessible to contemporary seekers.' },
      { Icon: Leaf, title: 'Legacy Continuity', description: 'Ensures the timeless wisdom of Sri Siddheswari Peetham remains a guiding force for future generations.' },
    ],
    gallery: [
      { image: datteshwaranandaImage, caption: 'H.H Sri Datteshwarananda Bharati Swamy' },
      { image: 'https://picsum.photos/seed/future1/600/400', caption: 'Youth Spiritual Camp' },
      { image: 'https://picsum.photos/seed/training2/600/400', caption: 'Vedic Training Session' },
      { image: 'https://picsum.photos/seed/puja3/600/400', caption: 'Ritual Initiation Ceremony' },
      { image: 'https://picsum.photos/seed/community4/600/400', caption: 'Community Outreach' },
      { image: 'https://picsum.photos/seed/lineage5/600/400', caption: 'With Sri Siddheswarananda Swamy' },
    ],
    image: datteshwaranandaImage,
  },
];

/* ─── Parampara labels ───────────────────────────────────── */
const PARAMPARA_LABELS = [
  'Founder',
  '1st Peethadhipathi',
  '2nd Peethadhipathi',
  '3rd Peethadhipathi',
  '4th Peethadhipathi',
  'Uttaradhikari',
];

/* ─── Desktop left sidebar ───────────────────────────────── */
function DesktopSwamiSidebar({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-[150] flex-col items-center py-4 px-3 gap-[6px]">
      {/* vertical connecting line */}
      <div className="absolute top-[calc(28px+1rem)] bottom-[calc(28px+1rem)] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-warm-cream/20 to-transparent pointer-events-none" />

      {SWAMI_FULL_DATA.map((swami, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} className="relative group flex items-center">
            {/* Portrait button */}
            <button
              onClick={() => onSelect(i)}
              title={swami.name}
              className={`relative w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all duration-300 outline-none z-10 ${active
                ? 'border-spiritual-gold scale-110 shadow-[0_0_0_3px_rgba(212,175,55,0.20),0_4px_16px_rgba(0,0,0,0.5)]'
                : 'border-white/15 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:border-white/50 hover:scale-105'
                }`}
            >
              <img src={swami.image} alt={swami.name} className="w-full h-full object-cover object-top" />
              {/* Active gold ring pulse */}
              {active && (
                <span className="absolute inset-0 rounded-full border border-spiritual-gold/40 animate-ping" />
              )}
            </button>

            {/* Hover tooltip — slides in to the right */}
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-20">
              <div className="bg-neutral-950 backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl border border-white/5">
                <p className="font-ui text-[7.5px] tracking-[0.22em] uppercase text-spiritual-gold/70 mb-[3px]">
                  {PARAMPARA_LABELS[i]}
                </p>
                <p className="font-serif text-warm-cream text-[13px] leading-tight">{swami.name}</p>
              </div>
              {/* Left-pointing arrow */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-neutral-950/92" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mobile horizontal swami bar ────────────────────────── */
function MobileSwamiBar({
  activeIndex,
  onSelect,
  onBack,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
  onBack: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      setScrolled(isScrolled);
      if (!isScrolled) setDrawerOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // +2 offset: children[0]=home button, children[1]=divider, children[2+]=swami buttons
    const el = scrollRef.current?.children[activeIndex + 2] as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex]);

  const activeSwami = SWAMI_FULL_DATA[activeIndex];

  return (
    <div className="lg:hidden">
      {/* ── Top bar — slides up and hides on scroll ── */}
      <motion.div
        animate={{ y: scrolled ? -120 : 0, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ pointerEvents: scrolled ? 'none' : 'auto' }}
        className="fixed top-[80px] left-0 right-0 z-[10001] bg-neutral-900 backdrop-blur-md border-b border-white/5 shadow-lg"
      >
        <div ref={scrollRef} className="swami-selector flex overflow-x-auto pt-2.5 pb-1.5 px-3 gap-3 items-center">
          <button
            onClick={onBack}
            aria-label="Back to Home"
            className="flex-shrink-0 outline-none mr-2 group"
          >
            <div className="w-9 h-9 rounded-full border-2 border-white/15 bg-neutral-800/80 flex items-center justify-center text-warm-cream/50 group-hover:text-warm-cream group-hover:border-white/40 transition-all duration-300">
              <ChevronLeft size={16} />
            </div>
          </button>

          <div className="flex-shrink-0 w-px bg-white/8 self-stretch my-1 mr-2" />

          {SWAMI_FULL_DATA.map((swami, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="flex-shrink-0 outline-none group"
              >
                <div
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-300 ${active
                    ? 'border-spiritual-gold shadow-[0_0_0_2px_rgba(212,175,55,0.18)]'
                    : 'border-white/10 grayscale opacity-50 group-hover:opacity-80 group-hover:grayscale-0'
                    }`}
                >
                  <img src={swami.image} alt={swami.name} className="w-full h-full object-cover object-top" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pb-2 text-center">
          <span className="font-ui text-[7px] tracking-[0.12em] uppercase text-spiritual-gold font-bold whitespace-nowrap">
            {activeSwami.name.replace('Sri ', '')}
          </span>
        </div>
      </motion.div>

      {/* ── Left edge tab — appears when scrolled, expands drawer ── */}
      {!drawerOpen && (
        <motion.button
          animate={{ x: scrolled ? 0 : -72, opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ pointerEvents: scrolled ? 'auto' : 'none' }}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open swami selector"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[10005] flex flex-col items-center gap-1.5 bg-neutral-900 backdrop-blur-md border border-l-0 border-white/10 rounded-r-xl px-1.5 py-3 shadow-xl"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-spiritual-gold/60">
            <img src={activeSwami.image} alt={activeSwami.name} className="w-full h-full object-cover object-top" />
          </div>
          <motion.div animate={{ rotate: drawerOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={12} className="text-warm-cream/60" />
          </motion.div>
        </motion.button>
      )}

      {/* ── Left drawer — full swami list ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[9998] bg-neutral-950/60 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-[80px] bottom-0 z-[20000] w-52 bg-neutral-900 backdrop-blur-md border-r border-white/5 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
                <span className="font-ui text-[8px] tracking-[0.25em] uppercase text-warm-cream/40">Parampara</span>
                <button onClick={() => setDrawerOpen(false)} className="text-warm-cream/40 hover:text-warm-cream transition-colors">
                  <ChevronLeft size={16} />
                </button>
              </div>

              <button
                onClick={() => { onBack(); setDrawerOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-warm-cream/50 hover:text-warm-cream hover:bg-white/5 transition-all border-b border-white/5"
              >
                <div className="w-7 h-7 rounded-full border border-white/15 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <ChevronLeft size={12} />
                </div>
                <span className="font-ui text-[9px] tracking-[0.15em] uppercase">Home</span>
              </button>

              <div className="flex-1 overflow-y-auto py-2">
                {SWAMI_FULL_DATA.map((swami, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => { onSelect(i); setDrawerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${active ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
                    >
                      <div className={`w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0 ${active ? 'border-spiritual-gold' : 'border-white/10'}`}>
                        <img src={swami.image} alt={swami.name} className={`w-full h-full object-cover object-top ${active ? '' : 'grayscale opacity-60'}`} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-ui text-[7px] tracking-[0.15em] uppercase leading-none mb-0.5 ${active ? 'text-spiritual-gold font-bold' : 'text-warm-cream/35'}`}>
                          {PARAMPARA_LABELS[i]}
                        </p>
                        <p className={`font-serif text-xs leading-tight ${active ? 'text-warm-cream' : 'text-warm-cream/50'}`}>
                          {swami.name.replace('Sri ', '')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Section fade-in wrapper ──────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Grain overlay ──────────────────────────────────────── */
function Grain({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none animate-grain z-[1]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────── */

interface SwamyPageProps {
  swamiIndex: number;
  onBack: () => void;
  onSelectSwami: (index: number) => void;
  onDonate?: () => void;
}

export default function SwamyPage({ swamiIndex, onBack, onSelectSwami, onDonate }: SwamyPageProps) {
  const [activeIndex, setActiveIndex] = useState(swamiIndex);
  const heroRef = useRef<HTMLDivElement>(null);

  // Sync internal state when prop changes (e.g. from hash change in parent)
  useEffect(() => {
    setActiveIndex(swamiIndex);
  }, [swamiIndex]);

  // Force scroll to top when active index changes
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [activeIndex]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const handleSelect = useCallback((i: number) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    onSelectSwami(i);
  }, [onSelectSwami]);

  const swami = SWAMI_FULL_DATA[activeIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 min-h-screen bg-warm-cream mb-[60vh]"
        style={{ overflowX: 'clip' }}
      >
        {/* ── Floating back button — desktop only, fixed top-left beside CardNav pill ── */}
        <button
          onClick={onBack}
          aria-label="Back to Home"
          className="hidden lg:flex fixed top-9 left-8 z-[100] items-center gap-2 rounded-full bg-neutral-950/80 backdrop-blur-sm border border-white/10 text-warm-cream/70 hover:text-warm-cream hover:border-white/30 hover:bg-[#A02d23] transition-all shadow-lg px-4 py-2"
        >
          <ChevronLeft size={16} />
          <span className="font-ui text-[10px] tracking-[0.2em] uppercase">Home</span>
        </button>

        {/* ── Mobile swami bar — sits below CardNav pill (~88px) ── */}
        <MobileSwamiBar activeIndex={activeIndex} onSelect={handleSelect} onBack={onBack} />

        {/* ── Desktop left sidebar ── */}
        <DesktopSwamiSidebar activeIndex={activeIndex} onSelect={handleSelect} />

        {/* ── Hero ── */}
        <div ref={heroRef} className="relative h-[100svh] min-h-[520px] overflow-hidden bg-neutral-950 lg:pt-0">
          <motion.img
            src={swami.image}
            alt={swami.name}
            style={{ y: heroImgY, scale: 1.3 }}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/96 via-neutral-950/40 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 to-transparent" />
          <Grain opacity={0.06} />

          {/* Hero content — offset from left sidebar on desktop */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="absolute inset-x-0 bottom-0 pl-6 pr-6 lg:pl-24 md:pr-14 pb-16 md:pb-24 z-10 max-w-4xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 font-ui text-[9px] tracking-[0.3em] uppercase text-spiritual-gold font-bold mb-4"
            >
              <span className="w-6 h-[1px] bg-spiritual-gold/60 inline-block" />
              {swami.year}
            </motion.span>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="font-ui text-[10px] tracking-[0.25em] uppercase text-warm-cream/40 mb-3"
            >
              {swami.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-warm-cream leading-[0.9] mb-6"
            >
              {swami.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-serif italic text-warm-cream/50 text-lg md:text-xl max-w-lg"
            >
              {swami.epitaph}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-8 flex items-center gap-6"
            >
              {swami.departed !== '—' && swami.departed !== 'In Blessed Life' && (
                <span className="flex items-center gap-2 text-warm-cream/40 font-ui text-[10px] tracking-widest uppercase">
                  <Calendar size={12} className="text-spiritual-gold/60" />
                  {swami.born.split(',')[0]} – {swami.departed}
                </span>
              )}
              <span className="flex items-center gap-2 text-warm-cream/40 font-ui text-[10px] tracking-widest uppercase">
                <MapPin size={12} className="text-spiritual-gold/60" />
                Courtallam, Tamilnadu
              </span>
            </motion.div>
          </motion.div>

          {/* Decorative OM */}
          <div
            className="absolute right-8 bottom-8 font-serif text-[160px] md:text-[220px] leading-none pointer-events-none select-none z-[2]"
            style={{ color: 'rgba(212,175,55,0.05)' }}
          >
            ॐ
          </div>
        </div>

        {/* ── Story ── */}
        <section className="bg-warm-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:pl-24 lg:pr-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-14 xl:gap-20">

              {/* Narrative */}
              <div>
                <FadeIn>
                  <span className="font-ui text-[9px] tracking-[0.3em] uppercase text-sacred-red/70 font-semibold mb-3 block">The Story</span>
                  <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-10 leading-tight">
                    A Life of <em>Sacred Purpose</em>
                  </h2>
                </FadeIn>
                <div className="space-y-6">
                  {swami.story.map((para, i) => (
                    <FadeIn key={i} delay={i * 0.08}>
                      <p
                        className={`text-neutral-600 leading-relaxed text-base md:text-lg font-sans ${i === 0 ? 'first-letter:text-5xl first-letter:font-serif first-letter:text-sacred-red first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none' : ''}`}
                      >
                        {para}
                      </p>
                    </FadeIn>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <FadeIn delay={0.2} className="lg:pt-24">
                <div className="bg-neutral-900 rounded-2xl p-7 space-y-5 relative overflow-hidden">
                  <Grain opacity={0.05} />
                  <div className="relative z-10">
                    <p className="font-ui text-[8px] tracking-[0.3em] uppercase text-spiritual-gold/60 mb-4">Details</p>

                    {[
                      { label: 'Full Name', value: swami.fullName },
                      { label: 'Period', value: swami.year },
                      { label: 'Born', value: swami.born },
                      { label: 'Departed', value: swami.departed },
                      { label: 'Birthplace', value: swami.birthplace },
                      { label: 'Parents', value: swami.parents },
                    ].map(({ label, value }) => (
                      <div key={label} className="py-3 border-b border-warm-cream/8 last:border-0">
                        <p className="font-ui text-[8px] tracking-[0.2em] uppercase text-warm-cream/30 mb-1">{label}</p>
                        <p className="text-warm-cream/80 text-sm font-sans leading-snug">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lineage position pill */}
                <div className="mt-5 rounded-xl border border-neutral-200 p-5">
                  <p className="font-ui text-[8px] tracking-[0.25em] uppercase text-neutral-400 mb-3">Position in Parampara</p>
                  <div className="flex items-center gap-1.5">
                    {SWAMI_FULL_DATA.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        title={s.name}
                        className={`transition-all duration-300 rounded-full overflow-hidden border-2 flex-shrink-0 ${i === activeIndex ? 'w-9 h-9 border-sacred-red' : 'w-6 h-6 border-neutral-200 opacity-50 hover:opacity-80'}`}
                      >
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>

            </div>
          </div>
        </section>

        {/* ── Pull Quote ── */}
        <section className="bg-neutral-950 py-20 md:py-28 relative overflow-hidden">
          <Grain opacity={0.07} />
          <div
            className="absolute inset-0 opacity-5 font-serif flex items-center justify-center text-[28vw] leading-none text-warm-cream pointer-events-none select-none"
          >
            ॐ
          </div>
          <FadeIn className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 lg:pl-24 text-center">
            <div className="h-[1px] bg-spiritual-gold/20 mb-10" />
            <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl italic text-warm-cream/90 leading-tight mb-10">
              {swami.pullQuote}
            </p>
            <p className="font-ui text-[9px] tracking-[0.3em] uppercase text-spiritual-gold/60">
              — {swami.name}
            </p>
            <div className="h-[1px] bg-spiritual-gold/20 mt-10" />
          </FadeIn>
        </section>

        {/* ── Key Contributions ── */}
        <section className="bg-neutral-900 py-20 md:py-28 relative overflow-hidden">
          <Grain opacity={0.05} />
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:pl-24 lg:pr-16 relative z-10">
            <FadeIn className="mb-14">
              <span className="font-ui text-[9px] tracking-[0.3em] uppercase text-sacred-red/70 font-semibold mb-3 block">Legacy</span>
              <h2 className="font-serif text-4xl md:text-5xl text-warm-cream leading-tight">
                Key <em>Contributions</em>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {swami.contributions.map((c, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <SpotlightCard
                    className="h-full bg-neutral-800/60 border border-warm-cream/5 rounded-2xl p-6 group"
                    spotlightColor="rgba(212,175,55,0.08)"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sacred-red/10 flex items-center justify-center mb-5 group-hover:bg-sacred-red/20 transition-colors">
                      <c.Icon size={18} className="text-sacred-red" />
                    </div>
                    <h3 className="font-serif text-xl text-warm-cream mb-3 leading-snug">{c.title}</h3>
                    <p className="text-warm-cream/45 text-sm leading-relaxed font-sans">{c.description}</p>
                  </SpotlightCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="bg-neutral-950 py-20 md:py-28 relative overflow-hidden">
          <Grain opacity={0.06} />
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:pl-24 lg:pr-16 relative z-10">
            <FadeIn className="mb-14">
              <span className="font-ui text-[9px] tracking-[0.3em] uppercase text-sacred-red/70 font-semibold mb-3 block">Visual Archive</span>
              <h2 className="font-serif text-4xl md:text-5xl text-warm-cream leading-tight">
                Photo <em>Gallery</em>
              </h2>
            </FadeIn>

            {/* Masonry-style grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {swami.gallery.map((item, i) => (
                <FadeIn
                  key={i}
                  delay={i * 0.06}
                  className={i === 0 ? 'col-span-2 md:col-span-2 row-span-1' : ''}
                >
                  <div className="relative overflow-hidden rounded-xl group cursor-pointer"
                    style={{ aspectRatio: i === 0 ? '16/9' : i % 3 === 2 ? '3/4' : '4/3' }}
                  >
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-warm-cream font-ui text-[9px] tracking-[0.15em] uppercase">{item.caption}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Guru Parampara ── */}
        <section className="bg-warm-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:pl-24 lg:pr-16">
            <FadeIn className="text-center mb-14">
              <span className="font-ui text-[9px] tracking-[0.3em] uppercase text-sacred-red/70 font-semibold mb-3 block">The Sacred Lineage</span>
              <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 leading-tight">
                Guru <em>Parampara</em>
              </h2>
            </FadeIn>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-[28px] left-0 right-0 h-[1px] bg-neutral-200 hidden md:block" />
              <div
                className="absolute top-[28px] left-0 h-[1px] bg-sacred-red hidden md:block transition-all duration-700"
                style={{ width: `${(activeIndex / (SWAMI_FULL_DATA.length - 1)) * 100}%` }}
              />

              <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-0">
                {SWAMI_FULL_DATA.map((s, i) => {
                  const isActive = i === activeIndex;
                  const isPast = i < activeIndex;
                  return (
                    <FadeIn key={i} delay={i * 0.06}>
                      <button
                        onClick={() => handleSelect(i)}
                        className={`flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center group outline-none w-full md:w-auto`}
                      >
                        <div
                          className={`relative w-14 h-14 md:w-[56px] md:h-[56px] rounded-full overflow-hidden flex-shrink-0 border-2 bg-warm-cream transition-all duration-400 ${isActive ? 'border-sacred-red shadow-[0_0_0_4px_rgba(160,45,35,0.12)]' : isPast ? 'border-sacred-red/30' : 'border-neutral-200 group-hover:border-neutral-400'}`}
                        >
                          <img
                            src={s.image}
                            alt={s.name}
                            className={`w-full h-full object-cover object-top transition-all duration-500 ${isActive ? '' : isPast ? 'grayscale brightness-90' : 'grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100'}`}
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-sacred-red/10 pointer-events-none" />
                          )}
                        </div>
                        <div>
                          <p className={`font-ui text-[8px] tracking-[0.15em] uppercase mb-0.5 transition-colors ${isActive ? 'text-sacred-red font-bold' : isPast ? 'text-neutral-500' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                            {s.year}
                          </p>
                          <p className={`font-serif text-sm leading-snug transition-colors ${isActive ? 'text-neutral-900' : isPast ? 'text-neutral-600' : 'text-neutral-400 group-hover:text-neutral-700'}`}>
                            {s.name.replace('Sri ', '')}
                          </p>
                        </div>
                      </button>
                    </FadeIn>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-14 pt-8 border-t border-neutral-200">
              <button
                disabled={activeIndex === 0}
                onClick={() => handleSelect(activeIndex - 1)}
                className="flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-sacred-red transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
                Previous Swami
              </button>
              <button
                disabled={activeIndex === SWAMI_FULL_DATA.length - 1}
                onClick={() => handleSelect(activeIndex + 1)}
                className="flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-sacred-red transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                Next Swami
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ── CTA / Footer ── */}
        <section className="bg-neutral-950 py-20 md:py-28 relative overflow-hidden">
          <Grain opacity={0.07} />
          <div className="max-w-4xl mx-auto px-6 md:px-10 text-center relative z-10">
            <FadeIn>
              <span className="font-ui text-[9px] tracking-[0.3em] uppercase text-sacred-red/70 font-semibold mb-6 block">Sri Siddheswari Peetham</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-warm-cream leading-tight mb-8">
                Be Part of <em>This Living Legacy</em>
              </h2>
              <p className="text-warm-cream/40 mb-12 max-w-xl mx-auto leading-relaxed font-sans">
                The Guru Parampara continues through devotees like you. Visit the Peetham, support the mission, or simply sit in silence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-8 py-4 border border-warm-cream/20 text-warm-cream/70 font-ui text-[10px] tracking-[0.25em] uppercase hover:bg-warm-cream/5 transition-colors rounded-sm"
                >
                  Return Home
                </button>
                {onDonate && (
                  <button
                    onClick={onDonate}
                    className="px-8 py-4 bg-sacred-red text-warm-cream font-ui text-[10px] tracking-[0.25em] uppercase hover:bg-sacred-red/80 transition-colors rounded-sm"
                  >
                    Support the Peetham
                  </button>
                )}
              </div>
            </FadeIn>
          </div>

        </section>

        <div className="bg-neutral-900 overflow-hidden py-14 border-b border-warm-cream/5">
          <ScrollVelocity
            texts={['Sri Siddheswari Peetham • Courtallam • Silence is Peace • Mouna Swamy Mutt • Sanatana Dharma • ']}
            velocity={30}
            className="font-serif text-3xl italic text-warm-cream/20 mx-24 tracking-widest"
            numCopies={4}
          />
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
