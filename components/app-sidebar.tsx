"use client";

import { useEffect , useState } from "react";
import { getDecks } from "@/lib/actions/getdecks";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ChevronRight,
  PlusCircle,
  Clock,
  Star,
  History,
  Rocket,
  MessageSquare,
  Video,
  Headphones,
  FileText,
  User,
  CreditCard,
  Shield,
  Presentation
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/actions/getuser";
import { useRouter } from "next/navigation";
const data = {
 
  navMain: [
    {
      title: "New Startup Blueprint",
      url: "/createpitchdeck",
      icon: SquareTerminal,
    },
    {
      title: "Blueprints",
      url: "/decks",
      icon: Presentation,
    },
    // {
    //   title: "CoFounder",
    //   url: "/cofounder",
    //   icon:Bot,
    // },
    {
      title:"Campaigns",
      url: "/campaigns",
      icon: Rocket,
      
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
          icon: User,
        },
        {
          title: "Team",
          url: "#",
          icon: User,
        },
        {
          title: "Billing",
          url: "#",
          icon: CreditCard,
        },
        {
          title: "Limits",
          url: "#",
          icon: Shield,
        },
      ],
    },
  ],
  History: [] as { title: string; url: string; icon: any }[],
};

const PITCH_DECKS_STORAGE_KEY = 'pitchDecks';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeSection, setActiveSection] = useState<string | null>("New Pitch Deck");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const[user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const router = useRouter();
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        
        setUser({
          ...user,
          avatar:  "/avatars/shadcn.jpg" // Add default avatar if not provided
        });
      }
    }
    fetchUser();
  }, []);

  // Load pitch decks from localStorage on component mount
  useEffect(() => {
    const loadDecksFromStorage = () => {
      try {
        const storedDecks = localStorage.getItem(PITCH_DECKS_STORAGE_KEY);
        if (storedDecks) {
          const parsedDecks = JSON.parse(storedDecks);
          data.History = parsedDecks.map((deck: any) => ({
            title: deck.title,
            url: `/pitchdeck/${deck.id}`,
            icon: Presentation,
          }));
        }
      } catch (error) {
        console.error('Error loading decks from localStorage:', error);
      }
    };

    // Load from localStorage first
    loadDecksFromStorage();

    // Then fetch fresh data
    const fetchDecks = async () => {
      try {
        const decks = await getDecks();
        if (decks) {
          // Sort decks by date and take only the latest three
          const sortedDecks = [...decks].sort((a, b) => 
            new Date(b.created_at).getTime() - 
            new Date(a.created_at).getTime()
          );

          // Save to localStorage
          localStorage.setItem(PITCH_DECKS_STORAGE_KEY, JSON.stringify(sortedDecks));

          // Update state
          data.History = sortedDecks.map(deck => ({
            title: deck.title,
            url: `/pitchdeck/${deck.id}`,
            icon: Presentation,
          }));
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    fetchDecks();
  }, []);
  

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedSections.includes(title);

  return (
    <Sidebar 
      className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#1E293B] text-gray-900 dark:text-[#F8FAFC] border-r border-gray-200 dark:border-[#1E293B] shadow-sm"
      variant="sidebar" 
      {...props}
    >
      <SidebarHeader className="border-b bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#1E293B] text-gray-900 dark:text-[#F8FAFC] border-gray-200 dark:border-[#1E293B] py-4">
        <SidebarMenu className="flex items-center ">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/appdash" className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#1E293B]/80 transition-colors">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-[#3B82F6] dark:to-[#FACC15] text-white flex aspect-square size-10 items-center justify-center rounded-lg shadow-md">
                  <Rocket className="size-5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-[#3B82F6] dark:to-[#FACC15]">
                  Foundrly
                  </span>
                  <span className="text-xs text-gray-600 dark:text-[#F8FAFC]/70">
                  AI-Powered Startup Advisor
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4 px-2 border-b border-gray-200 dark:border-[#1E293B] bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#1E293B] text-gray-900 dark:text-[#F8FAFC] shadow-sm">
        {/* Custom Nav Implementation */}
        <div className="space-y-6">
          <div className="px-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-[#F8FAFC]/60 uppercase tracking-wider">
              Main
            </h3>
            <ul className="mt-2 space-y-1">
              {data.navMain.map((item, index) => (
                <li key={index}>
                  {!item.items ? (
                    <a
                      href={item.url}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === item.title
                          ? "bg-indigo-100 dark:bg-[#3B82F6]/20 text-indigo-600 dark:text-[#3B82F6] font-medium"
                          : "text-gray-700 dark:text-[#F8FAFC] hover:bg-gray-200/50 dark:hover:bg-[#1E293B]/50"
                      }`}
                      onClick={() => setActiveSection(item.title)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`size-5 ${
                          activeSection === item.title
                            ? "text-indigo-600 dark:text-[#3B82F6]"
                            : "text-gray-500 dark:text-[#F8FAFC]/70"
                        }`} />
                        <span>{item.title}</span>
                      </div>
                      {item.items && (
                        <ChevronRight className={`size-4 transition-transform ${
                          isExpanded(item) ? "rotate-90" : ""
                        }`} />
                      )}
                    </a>
                    
                  ) : (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeSection === item.title
                            ? "bg-indigo-100 dark:bg-[#3B82F6]/20 text-indigo-600 dark:text-[#3B82F6] font-medium"
                            : "text-gray-700 dark:text-[#F8FAFC] hover:bg-gray-200/50 dark:hover:bg-[#1E293B]/50"
                        }`}
                        onClick={() => {
                          toggleSection(item.title);
                          setActiveSection(item.title);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`size-5 ${
                            activeSection === item.title
                              ? "text-indigo-600 dark:text-[#3B82F6]"
                              : "text-gray-500 dark:text-[#F8FAFC]/70"
                          }`} />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={`size-4 transition-transform ${
                          isExpanded(item.title) ? "rotate-90" : ""
                        }`} />
                      </button>
                      
                      {isExpanded(item.title) && (
                        <ul className="mt-1 ml-2 pl-6 space-y-1 border-l border-gray-200 dark:border-[#1E293B]">
                          {item.items.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-[#F8FAFC] hover:bg-gray-200/50 dark:hover:bg-[#1E293B]/50 hover:text-indigo-600 dark:hover:text-[#3B82F6] transition-colors"
                              >
                                {subItem.icon && <subItem.icon className="size-4 text-gray-500 dark:text-[#F8FAFC]/70" />}
                                <span>{subItem.title}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-gray-500 dark:text-[#F8FAFC]/60 uppercase tracking-wider">
                Recent Projects
              </h3>
                  <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#1E293B] text-gray-500 dark:text-[#F8FAFC]/70"
                  onClick={() => router.push("/createpitchdeck")}
                  >
                  <PlusCircle className="size-4" />
                  </button>
            </div>
            
            <div className="mt-4 space-y-1">
              {data.History.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 dark:bg-[#1E293B]/50 rounded-lg">
                  <Clock className="size-8 mb-2 text-gray-400 dark:text-[#F8FAFC]/50" />
                  <p className="text-sm text-gray-500 dark:text-[#F8FAFC]/70">No recent projects</p>
                  <button className="mt-3 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 dark:bg-[#3B82F6] dark:hover:bg-[#FACC15] dark:hover:text-[#0F172A] text-white rounded-lg flex items-center gap-1 transition-colors">
                    <PlusCircle className="size-3.5" />
                    Create New Project
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {data.History.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.url}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-[#F8FAFC] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
                      >
                        <item.icon className="size-4 text-gray-500 dark:text-[#F8FAFC]/70" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t bg-gradient-to-br from-white to-gray-100 dark:from-[#0F172A] dark:to-[#1E293B] border-gray-200 dark:border-[#1E293B] p-4">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
